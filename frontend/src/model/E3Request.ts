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
    TimestepValue
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
                .addOutputType("measure")
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
                .inflationRate(project.inflationRate ?? 0);

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

            const hasBaseline = !!project.alternatives.find((alt) => alt.baseline);
            if (!hasBaseline) alternativeBuilders[0].baseline();

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

    const builder = new BcnBuilder()
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .name(cost.name)
        .real()
        .invest()
        .initialOccurrence(0)
        .life(cost.expectedLife)
        .addTag(tag)
        .quantityValue(cost.initialCost ?? 0); //TODO residual value

    if (cost.residualValue)
        return [
            builder,
            residualValueBcn(
                cost,
                (cost.initialCost ?? 0) + (cost.amountFinanced ?? 0),
                cost.residualValue,
                studyPeriod,
                [tag]
            )
        ];

    return [builder];
}

function energyCostToBuilder(cost: EnergyCost): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .addTag("Energy", cost.fuelType, cost.unit)
        .name(cost.name)
        .real()
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .recur(new RecurBuilder().interval(1))
        .quantityValue(cost.costPerUnit)
        .quantity(cost.annualConsumption); // TODO escalation

    if (cost.customerSector) builder.addTag(cost.customerSector);

    return [builder];
}

function waterCostToBuilder(cost: WaterCost): BcnBuilder[] {
    const builder = new BcnBuilder().name(cost.name).addTag(cost.unit).addTag("Water Usage");
    return [builder]; // TODO
}

function replacementCapitalCostToBuilder(cost: ReplacementCapitalCost, studyPeriod: number): BcnBuilder[] {
    const builder = new BcnBuilder()
        .name(cost.name)
        .real()
        .invest()
        .addTag("Replacement Capital")
        .life(cost.expectedLife ?? 1)
        .quantityValue(cost.initialCost)
        .quantityValue(1); //TODO annual rate of change

    if (cost.residualValue) return [builder, residualValueBcn(cost, cost.initialCost, cost.residualValue, studyPeriod)];

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

    if (cost.recurring) builder.recur(new RecurBuilder().interval(1));

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
        .quantityValue(1); // TODO rate of change

    if (cost.recurring) builder.recur(new RecurBuilder().interval(cost.rateOfRecurrence ?? 1));

    return [builder];
}

function residualValueBcn(cost: Cost, value: number, obj: ResidualValue, studyPeriod: number, tags: string[] = []) {
    return new BcnBuilder()
        .name(`${cost.name} Residual Value`)
        .type(BcnType.BENEFIT)
        .subType(BcnSubType.DIRECT)
        .addTag(...tags)
        .real()
        .initialOccurrence(studyPeriod + 1)
        .quantity(1)
        .quantityValue(obj.approach === DollarOrPercent.PERCENT ? value * -obj.value : -obj.value);
}
