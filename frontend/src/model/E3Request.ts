import {
    AlternativeBuilder,
    AnalysisBuilder,
    AnalysisType,
    BcnBuilder,
    BcnSubType,
    BcnType,
    E3,
    type Output,
    ProjectType,
    RecurBuilder,
    RequestBuilder,
    TimestepComp,
    TimestepValue,
    VarRate,
} from "@lrd/e3-sdk";
import {
    type CapitalCost,
    type Cost,
    CostBenefit,
    CostTypes,
    DiscountingMethod,
    DollarOrPercent,
    type EnergyCost,
    type ID,
    type ImplementationContractCost,
    type OMRCost,
    type OtherCost,
    type OtherNonMonetary,
    type RecurringContractCost,
    type ReplacementCapitalCost,
    type ResidualValue,
    type WaterCost,
} from "blcc-format/Format";
import { Model } from "model/Model";
import { db } from "model/db";
import { type Observable, type UnaryFunction, map, pipe, switchMap } from "rxjs";
import { ajax } from "rxjs/internal/ajax/ajax";
import { withLatestFrom } from "rxjs/operators";
import { getConvertMap } from "util/UnitConversion";

/**
 * RXJS operator to take the project and create an E3 request.
 */
export function toE3Object(): UnaryFunction<Observable<ID>, Observable<RequestBuilder>> {
    return pipe(
        withLatestFrom(Model.emissions$, Model.scc$),
        switchMap(async ([projectID, emissions, scc]) => {
            const project = await db.projects.get(projectID);

            if (project === undefined) throw "No project in database";

            const builder = new RequestBuilder();

            // Setup base E3 options
            const analysisBuilder = new AnalysisBuilder()
                .type(AnalysisType.LCCA)
                .projectType(ProjectType.OTHER)
                .addOutputType("measure", "optional", "required")
                .studyPeriod(project.studyPeriod ?? 0)
                .timestepValue(TimestepValue.YEAR)
                .timestepComp(
                    project.discountingMethod === DiscountingMethod.END_OF_YEAR
                        ? TimestepComp.END_OF_YEAR
                        : TimestepComp.MID_YEAR,
                )
                .real()
                .discountRateReal(project.realDiscountRate ?? 0)
                .discountRateNominal(project.nominalDiscountRate ?? 0)
                .inflationRate(project.inflationRate ?? 0)
                .reinvestRate(project.inflationRate ?? 0); //replace with actual reinvest rate

            // Create costs
            const costs = await db.costs.where("id").anyOf(project.costs).toArray();
            const costMap = new Map(
                costs.map((cost) => [cost.id, costToBuilders(cost, project.studyPeriod ?? 0, emissions, scc)]),
            );

            // Define alternatives
            const alternatives = await db.alternatives.where("id").anyOf(project.alternatives).toArray();
            const alternativeBuilders = alternatives.map((alternative) => {
                const builder = new AlternativeBuilder()
                    .name(alternative.name)
                    .addBcn(
                        ...alternative.costs
                            .flatMap((id) => costMap.get(id))
                            .filter((x): x is BcnBuilder => x !== undefined),
                    );

                if (alternative.id) builder.id(alternative.id);
                if (alternative.baseline) return builder.baseline();

                return builder;
            });

            const hasBaseline = !!alternatives.find((alt) => alt.baseline);
            if (!hasBaseline && alternativeBuilders[0]) alternativeBuilders[0].baseline();

            // Create complete Request Builder and return
            return builder.analysis(analysisBuilder).addAlternative(...alternativeBuilders);
        }),
    );
}

/**
 * RXJS operator that tasks an E3 Request Builder object and executes the request and returns the E3 output object.
 */
export function E3Request(): UnaryFunction<Observable<RequestBuilder>, Observable<Output>> {
    return pipe(
        switchMap((builder) =>
            ajax<Output>({
                url: "/api/e3_request",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {
                    request: JSON.stringify(builder.build()),
                },
            }),
        ),
        map((response) => response.response),
    );
}

function costToBuilders(
    cost: Cost,
    studyPeriod: number,
    emissions: number[] | undefined,
    scc: number[] | undefined,
): BcnBuilder[] {
    switch (cost.type) {
        case CostTypes.CAPITAL:
            return capitalCostToBuilder(cost, studyPeriod);
        case CostTypes.ENERGY:
            return energyCostToBuilder(cost, emissions, scc);
        case CostTypes.WATER:
            return waterCostToBuilder(cost);
        case CostTypes.REPLACEMENT_CAPITAL:
            return replacementCapitalCostToBuilder(cost, studyPeriod);
        case CostTypes.OMR:
            return omrCostToBuilder(cost);
        case CostTypes.IMPLEMENTATION_CONTRACT:
            return implementationContractCostToBuilder(cost);
        case CostTypes.RECURRING_CONTRACT:
            return recurringContractCostToBuilder(cost);
        case CostTypes.OTHER:
            return otherCostToBuilder(cost);
        case CostTypes.OTHER_NON_MONETARY:
            return otherNonMonetaryCostToBuilder(cost);
    }
}

function capitalCostToBuilder(cost: CapitalCost, studyPeriod: number): BcnBuilder[] {
    const tag = "Initial Investment";
    const result = [];

    if (cost.phaseIn) {
        // Create multiple phase in BCNs
        const adjusted = (cost.initialCost ?? 0) * (1 + (cost.costAdjustment ?? 0)) ** cost.phaseIn.length;

        result.push(
            ...cost.phaseIn.map((phaseIn, i) =>
                new BcnBuilder()
                    .type(BcnType.COST)
                    .subType(BcnSubType.DIRECT)
                    .name(`${cost.name} Phase-In year ${i}`)
                    .real()
                    .invest()
                    .initialOccurrence(0)
                    .life(cost.expectedLife)
                    .addTag(tag, "LCC")
                    .quantity(1)
                    .quantityValue(adjusted * phaseIn),
            ),
        );
    } else {
        // Default BCN
        result.push(
            new BcnBuilder()
                .type(BcnType.COST)
                .subType(BcnSubType.DIRECT)
                .name(cost.name)
                .real()
                .invest()
                .initialOccurrence(0)
                .life(cost.expectedLife)
                .addTag(tag, "LCC")
                .quantity(1)
                .quantityValue(cost.initialCost ?? 0),
        );
    }

    // Add residual value if there is any
    if (cost.residualValue)
        result.push(
            residualValueBcn(
                cost,
                (cost.initialCost ?? 0) + (cost.amountFinanced ?? 0),
                cost.residualValue,
                studyPeriod,
                cost.annualRateOfChange ?? 0,
                [tag],
            ),
        );

    return result;
}

function energyCostToBuilder(
    cost: EnergyCost,
    emissions: number[] | undefined,
    scc: number[] | undefined,
): BcnBuilder[] {
    const result = [];

    const builder = new BcnBuilder()
        .name(cost.name)
        .addTag("Energy", cost.fuelType, cost.unit, "LCC")
        .real()
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .recur(recurrence(cost))
        .quantityValue(cost.costPerUnit)
        .quantity(cost.annualConsumption);
    result.push(builder);

    if (cost.demandCharge !== undefined) {
        result.push(
            new BcnBuilder()
                .name(`${cost.name} Demand Charge`)
                .addTag("Demand Charge", "LCC")
                .real()
                .type(BcnType.COST)
                .subType(BcnSubType.DIRECT)
                .recur(recurrence(cost))
                .quantityValue(cost.demandCharge)
                .quantity(1),
        );
    }

    if (cost.rebate !== undefined) {
        result.push(
            new BcnBuilder()
                .name(`${cost.name} Rebate`)
                .addTag("Rebate", "LCC")
                .real()
                .type(BcnType.BENEFIT)
                .subType(BcnSubType.DIRECT)
                .quantityValue(-cost.rebate)
                .quantity(1),
        );
    }

    if (cost.useIndex) {
        const varValue = Array.isArray(cost.useIndex) ? cost.useIndex : [cost.useIndex];
        builder.quantityVarValue(varValue).quantityVarRate(VarRate.YEAR_BY_YEAR);
    }

    if (cost.customerSector) builder.addTag(cost.customerSector);

    // Emissions
    // Convert cost value to correct emissions unit. Usually MWh, but can also be MJ for coal.
    const convertedUnit = getConvertMap(cost.fuelType)[cost.unit]?.(cost.annualConsumption);

    // If unit conversion failed or we have no emissions data, return
    if (convertedUnit === undefined || emissions === undefined) return result;

    const emissionValues = emissions.map((value) => value * convertedUnit);

    result.push(
        new BcnBuilder()
            .name(`${cost.name} Emissions`)
            .addTag("Emissions", `${cost.fuelType} Emissions`, "kg co2")
            .real()
            .type(BcnType.NON_MONETARY)
            .recur(recurrence(cost))
            .quantity(1)
            .quantityValue(1)
            .quantityVarRate(VarRate.YEAR_BY_YEAR)
            .quantityVarValue(emissionValues)
            .quantityUnit("kg co2"),
    );

    if (scc === undefined) return result;

    result.push(
        new BcnBuilder()
            .name(`${cost.name} SCC`)
            .addTag("SCC", `${cost.fuelType} SCC`, "$/kg")
            .real()
            .type(BcnType.COST)
            .recur(recurrence(cost))
            .quantity(1)
            .quantityValue(1)
            .quantityVarRate(VarRate.YEAR_BY_YEAR)
            .quantityVarValue(scc.map((v, i) => v * emissionValues[i]))
            .quantityUnit("$/kg co2"),
    );

    return result;
}

function recurrence(cost: EnergyCost | WaterCost): RecurBuilder {
    const builder = new RecurBuilder().interval(1);

    if (cost.escalation)
        builder
            .varRate(VarRate.YEAR_BY_YEAR)
            .varValue(Array.isArray(cost.escalation) ? cost.escalation : [cost.escalation]);

    return builder;
}

function waterCostToBuilder(cost: WaterCost): BcnBuilder[] {
    const recurBuilder = recurrence(cost);

    return [
        ...cost.usage.map((usage) => {
            const builder = new BcnBuilder()
                .name(cost.name)
                .addTag(cost.unit, "LCC", `${cost.name} ${usage.season} Water Usage`)
                .real()
                .invest()
                .recur(recurBuilder)
                .quantity(usage.amount)
                .quantityValue(usage.costPerUnit);

            if (cost.useIndex) {
                const varValue = Array.isArray(cost.useIndex) ? cost.useIndex : [cost.useIndex];
                builder.quantityVarValue(varValue).quantityVarRate(VarRate.YEAR_BY_YEAR);
            }

            return builder;
        }),
        ...cost.disposal.map((disposal) => {
            const builder = new BcnBuilder()
                .name(cost.name)
                .addTag(cost.unit, "LCC", `${cost.name} ${disposal.season} Water Disposal`)
                .real()
                .invest()
                .recur(recurBuilder)
                .quantity(disposal.amount)
                .quantityValue(disposal.costPerUnit);

            if (cost.useIndex) {
                const varValue = Array.isArray(cost.useIndex) ? cost.useIndex : [cost.useIndex];
                builder.quantityVarValue(varValue).quantityVarRate(VarRate.YEAR_BY_YEAR);
            }

            return builder;
        }),
    ];
}

function replacementCapitalCostToBuilder(cost: ReplacementCapitalCost, studyPeriod: number): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .real()
        .invest()
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .addTag("Replacement Capital", "LCC")
        .life(cost.expectedLife ?? 1)
        .quantity(1)
        .quantityValue(cost.initialCost)
        .quantityValue(1);

    if (cost.residualValue)
        return [
            builder,
            residualValueBcn(cost, cost.initialCost, cost.residualValue, studyPeriod, cost.annualRateOfChange ?? 0),
        ];

    return [builder];
}

function omrCostToBuilder(cost: OMRCost): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .addTag("OMR", "LCC")
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .initialOccurrence(cost.initialOccurrence)
        .real()
        .quantityValue(cost.initialCost)
        .quantity(1);

    if (cost.recurring?.rateOfRecurrence) {
        builder.addTag("OMR Recurring").recur(new RecurBuilder().interval(cost.recurring?.rateOfRecurrence ?? 0)); //TODO rate of change
    } else {
        builder.addTag("OMR Non-Recurring");
    }

    return [builder];
}

function implementationContractCostToBuilder(cost: ImplementationContractCost): BcnBuilder[] {
    return [
        new BcnBuilder()
            .name(cost.name)
            .type(BcnType.COST)
            .subType(BcnSubType.DIRECT)
            .addTag("Implementation Contract Cost", "LCC")
            .real()
            .invest()
            .quantity(1)
            .quantityValue(cost.cost)
            .initialOccurrence(cost.occurrence + 1),
    ];
}

function recurringContractCostToBuilder(cost: RecurringContractCost): BcnBuilder[] {
    return [
        new BcnBuilder()
            .name(cost.name)
            .type(BcnType.COST)
            .subType(BcnSubType.DIRECT)
            .addTag("Recurring Contract Cost", "LCC")
            .real()
            .invest()
            .recur(new RecurBuilder().interval(cost.recurring?.rateOfRecurrence ?? 1))
            .initialOccurrence(cost.initialOccurrence)
            .quantity(1)
            .quantityValue(cost.initialOccurrence + 1),
    ];
}

function otherCostToBuilder(cost: OtherCost): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .real()
        .invest()
        .initialOccurrence(cost.initialOccurrence)
        .type(cost.costOrBenefit === CostBenefit.COST ? BcnType.COST : BcnType.BENEFIT)
        .subType(BcnSubType.DIRECT)
        .addTag("Other", "LCC")
        .addTag(...(cost.tags ?? []))
        .addTag(cost.unit ?? "")
        .quantityValue(cost.valuePerUnit)
        .quantity(cost.numberOfUnits)
        .quantityUnit(cost.unit ?? ""); //TODO rate of change

    applyRateOfChange(builder, cost);

    return [builder];
}

function otherNonMonetaryCostToBuilder(cost: OtherNonMonetary): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .addTag("Other Non-Monetary")
        .addTag(cost.unit ?? "")
        .addTag(...(cost.tags ?? []))
        .initialOccurrence(cost.initialOccurrence)
        .type(BcnType.NON_MONETARY)
        .subType(BcnSubType.DIRECT)
        .quantity(cost.numberOfUnits)
        .quantityValue(1);

    applyRateOfChange(builder, cost);

    return [builder];
}

function applyRateOfChange(builder: BcnBuilder, cost: OtherCost | OtherNonMonetary) {
    if (cost.recurring?.rateOfChangeUnits)
        builder
            .quantityVarRate(VarRate.YEAR_BY_YEAR)
            .quantityVarValue(
                Array.isArray(cost.recurring.rateOfChangeUnits)
                    ? cost.recurring.rateOfChangeUnits
                    : [cost.recurring.rateOfChangeUnits],
            );

    if (cost.recurring) {
        const recurBuilder = new RecurBuilder().interval(1);

        if (cost.recurring.rateOfChangeValue) {
            recurBuilder
                .varRate(VarRate.YEAR_BY_YEAR)
                .varValue(
                    Array.isArray(cost.recurring.rateOfChangeValue)
                        ? cost.recurring.rateOfChangeValue
                        : [cost.recurring.rateOfChangeValue],
                );
        }

        builder.recur(recurBuilder);
    }
}

function residualValueBcn(
    cost: Cost,
    value: number,
    obj: ResidualValue,
    studyPeriod: number,
    rateOfChange: number,
    tags: string[] = [],
): BcnBuilder {
    return new BcnBuilder()
        .name(`${cost.name} Residual Value`)
        .type(BcnType.BENEFIT)
        .subType(BcnSubType.DIRECT)
        .addTag(...tags)
        .addTag("LCC", "Residual Value")
        .real()
        .initialOccurrence(studyPeriod + 1)
        .quantity(1)
        .quantityValue(
            obj.approach === DollarOrPercent.PERCENT
                ? value * (1 + rateOfChange) ** studyPeriod * -obj.value
                : -obj.value,
        );
}
