import { map, Observable, pipe, switchMap, UnaryFunction } from "rxjs";
import {
    CapitalCost,
    Cost,
    CostBenefit,
    CostTypes,
    DiscountingMethod,
    DollarOrPercent,
    EnergyCost,
    ImplementationContractCost,
    OMRCost,
    OtherCost,
    OtherNonMonetary,
    Project,
    RecurringContractCost,
    ReplacementCapitalCost,
    ResidualValue,
    WaterCost
} from "../blcc-format/Format";
import {
    AlternativeBuilder,
    AnalysisBuilder,
    AnalysisType,
    BcnBuilder,
    BcnSubType,
    BcnType,
    E3,
    Output,
    ProjectType,
    RecurBuilder,
    RequestBuilder,
    TimestepComp,
    TimestepValue,
    VarRate
} from "e3-sdk";

/**
 * RXJS operator to take the project and create an E3 reqeust.
 */
export function toE3Object(): UnaryFunction<Observable<Project>, Observable<RequestBuilder>> {
    return pipe(
        map((project) => {
            const builder = new RequestBuilder();

            // Setup base E3 options
            const analysisBuilder = new AnalysisBuilder()
                .type(AnalysisType.LCCA)
                .projectType(ProjectType.OTHER)
                .addOutputType("measure", "optional", "required")
                .studyPeriod(project.studyPeriod)
                .timestepValue(TimestepValue.YEAR)
                .timestepComp(
                    project.discountingMethod === DiscountingMethod.END_OF_YEAR
                        ? TimestepComp.END_OF_YEAR
                        : TimestepComp.MID_YEAR
                )
                .outputReal() // TODO add interest rate
                .discountRateReal(project.realDiscountRate ?? 0)
                .discountRateNominal(project.nominalDiscountRate ?? 0)
                .inflationRate(project.inflationRate ?? 0)
                .reinvestRate(project.inflationRate ?? 0); //replace with actual reinvest rate

            // Create costs
            const costs = new Map(project.costs.map((cost) => [cost.id, costToBuilders(cost, project.studyPeriod)]));

            // Define alternatives
            const alternativeBuilders = project.alternatives.map((alternative) => {
                const builder = new AlternativeBuilder()
                    .name(alternative.name)
                    .addBcn(
                        ...alternative.costs
                            .flatMap((id) => costs.get(id))
                            .filter((x): x is BcnBuilder => x !== undefined)
                    );

                if (alternative.baseline) return builder.baseline();

                return builder;
            });

            const hasBaseline = !!project.alternatives.find((alt) => alt["baseline"]);
            if (!hasBaseline && alternativeBuilders[0]) alternativeBuilders[0].baseline();

            // Create complete Request Builder and return
            return builder.analysis(analysisBuilder).addAlternative(...alternativeBuilders);
        })
    );
}

/**
 * RXJS operator that tasks an E3 Request Builder object and executes the request and returns the E3 output object.
 */
export function E3Request(): UnaryFunction<Observable<RequestBuilder>, Observable<Output>> {
    return pipe(
        switchMap((builder) => E3.analyze(import.meta.env.VITE_REQUEST_URL, builder, import.meta.env.VITE_API_TOKEN))
    );
}

function costToBuilders(cost: Cost, studyPeriod: number): BcnBuilder[] {
    switch (cost.type) {
        case CostTypes.CAPITAL:
            return capitalCostToBuilder(cost, studyPeriod);
        case CostTypes.ENERGY:
            return energyCostToBuilder(cost);
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
        const adjusted = (cost.initialCost ?? 0) * Math.pow(1 + (cost.costAdjustment ?? 0), cost.phaseIn.length);

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
                    .addTag(tag)
                    .quantity(1)
                    .quantityValue(adjusted * phaseIn)
            )
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
                .addTag(tag)
                .quantity(1)
                .quantityValue(cost.initialCost ?? 0)
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
                [tag]
            )
        );

    return result;
}

function energyCostToBuilder(cost: EnergyCost): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .addTag("Energy", cost.fuelType, cost.unit)
        .name(cost.name)
        .real()
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .recur(recurrence(cost))
        .quantityValue(cost.costPerUnit)
        .quantity(cost.annualConsumption);

    if (cost.useIndex) {
        const varValue = Array.isArray(cost.useIndex) ? cost.useIndex : [cost.useIndex];
        builder.quantityVarValue(varValue).quantityVarRate(VarRate.YEAR_BY_YEAR);
    }

    if (cost.customerSector) builder.addTag(cost.customerSector);

    return [builder];
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
                .addTag(cost.unit)
                .addTag(`${cost.name} ${usage.season} Water Usage`)
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
                .addTag(cost.unit)
                .addTag(`${cost.name} ${disposal.season} Water Disposal`)
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
        })
    ];
}

function replacementCapitalCostToBuilder(cost: ReplacementCapitalCost, studyPeriod: number): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .real()
        .invest()
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .addTag("Replacement Capital")
        .life(cost.expectedLife ?? 1)
        .quantity(1)
        .quantityValue(cost.initialCost)
        .quantityValue(1);

    if (cost.residualValue)
        return [
            builder,
            residualValueBcn(cost, cost.initialCost, cost.residualValue, studyPeriod, cost.annualRateOfChange ?? 0)
        ];

    return [builder];
}

function omrCostToBuilder(cost: OMRCost): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .addTag("OMR")
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .initialOccurrence(cost.initialOccurrence)
        .real()
        .quantityValue(cost.initialCost)
        .quantity(1);

    if (cost.rateOfRecurrence) builder.recur(new RecurBuilder().interval(cost.rateOfRecurrence)); //TODO rate of change

    return [builder];
}

function implementationContractCostToBuilder(cost: ImplementationContractCost): BcnBuilder[] {
    return [
        new BcnBuilder()
            .name(cost.name)
            .type(BcnType.COST)
            .subType(BcnSubType.DIRECT)
            .addTag("Implementation Contract Cost")
            .real()
            .invest()
            .quantity(1)
            .quantityValue(cost.cost)
            .initialOccurrence(cost.occurrence + 1)
    ];
}

function recurringContractCostToBuilder(cost: RecurringContractCost): BcnBuilder[] {
    return [
        new BcnBuilder()
            .name(cost.name)
            .type(BcnType.COST)
            .subType(BcnSubType.DIRECT)
            .addTag("Recurring Contract Cost")
            .real()
            .invest()
            .recur(new RecurBuilder().interval(cost.rateOfRecurrence ?? 1))
            .initialOccurrence(cost.initialOccurrence)
            .quantity(1)
            .quantityValue(cost.initialOccurrence + 1)
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
        .addTag("Other")
        .addTag(cost.tag)
        .addTag(cost.unit)
        .quantityValue(cost.valuePerUnit)
        .quantity(cost.numberOfUnits)
        .quantityUnit(cost.unit); //TODO rate of change

    applyRateOfChange(builder, cost);

    return [builder];
}

function otherNonMonetaryCostToBuilder(cost: OtherNonMonetary): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .addTag("Other Non-Monetary")
        .addTag(cost.unit)
        .addTag(cost.tag)
        .initialOccurrence(cost.initialOccurrence)
        .type(BcnType.NON_MONETARY)
        .subType(BcnSubType.DIRECT)
        .quantity(cost.numberOfUnits)
        .quantityValue(1);

    applyRateOfChange(builder, cost);

    return [builder];
}

function applyRateOfChange(builder: BcnBuilder, cost: OtherCost | OtherNonMonetary) {
    if (cost.rateOfChangeUnits)
        builder
            .quantityVarRate(VarRate.YEAR_BY_YEAR)
            .quantityVarValue(
                Array.isArray(cost.rateOfChangeUnits) ? cost.rateOfChangeUnits : [cost.rateOfChangeUnits]
            );

    if (cost.recurring) {
        const recurBuilder = new RecurBuilder().interval(1);

        if (cost.rateOfChangeValue) {
            recurBuilder
                .varRate(VarRate.YEAR_BY_YEAR)
                .varValue(Array.isArray(cost.rateOfChangeValue) ? cost.rateOfChangeValue : [cost.rateOfChangeValue]);
        }

        builder.recur(recurBuilder);
    }
}

function residualValueBcn(
    cost: Cost,
    value: number,
    obj: ResidualValue,
    studyPeriod: number,
    rateOfChange: number = 0,
    tags: string[] = []
): BcnBuilder {
    return new BcnBuilder()
        .name(`${cost.name} Residual Value`)
        .type(BcnType.BENEFIT)
        .subType(BcnSubType.DIRECT)
        .addTag(...tags)
        .real()
        .initialOccurrence(studyPeriod + 1)
        .quantity(1)
        .quantityValue(
            obj.approach === DollarOrPercent.PERCENT
                ? value * Math.pow(1 + rateOfChange, studyPeriod) * -obj.value
                : -obj.value
        );
}
