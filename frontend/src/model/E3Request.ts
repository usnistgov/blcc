import { map, Observable, pipe, switchMap, UnaryFunction } from "rxjs";
import {
    CapitalCost,
    Cost,
    CostTypes,
    EnergyCost,
    ImplementationContractCost,
    OMRCost,
    OtherCost,
    OtherNonMonetary,
    Project,
    RecurringContractCost,
    ReplacementCapitalCost,
    WaterCost
} from "../blcc-format/Format";
import {
    AlternativeBuilder,
    AnalysisBuilder,
    AnalysisType,
    BcnBuilder,
    BcnType,
    E3,
    Output,
    RequestBuilder,
    BcnSubType
} from "e3-sdk";

export function toE3Request(): UnaryFunction<Observable<Project>, Observable<RequestBuilder>> {
    return pipe(
        map((project) => {
            const builder = new RequestBuilder();

            const analysisBuilder = new AnalysisBuilder();
            analysisBuilder.type(AnalysisType.BCA);

            project.costs.map((cost) => {
                return costToBuilder(cost);
            });

            project.alternatives.map((alternative) => {
                const builder = new AlternativeBuilder().name(alternative.name);

                if (alternative.baseline) return builder.baseline();
                return builder;
            });

            builder.analysis(analysisBuilder);

            return builder;
        })
    );
}

export function makeRequest(): UnaryFunction<Observable<RequestBuilder>, Observable<Output>> {
    return pipe(
        switchMap((builder) => E3.analyze(import.meta.env.VITE_REQUEST_URL, builder, import.meta.env.VITE_API_TOKEN))
    );
}

function costToBuilder(cost: Cost) {
    switch (cost.type) {
        case CostTypes.CAPITAL:
            return capitalCostToBuilder(cost);
        case CostTypes.ENERGY:
            return energyCostToBuilder(cost);
        case CostTypes.WATER:
            return waterCostToBuilder(cost);
        case CostTypes.REPLACEMENT_CAPITAL:
            return replacementCapitalCostToBuilder(cost);
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

function capitalCostToBuilder(cost: CapitalCost) {
    return new BcnBuilder()
        .type(BcnType.COST)
        .subType(BcnSubType.DIRECT)
        .name(cost.name)
        .initialOccurrence(0)
        .life(cost.expectedLife);
}

function energyCostToBuilder(cost: EnergyCost) {
    return new BcnBuilder().name(cost.name);
}

function waterCostToBuilder(cost: WaterCost) {
    return new BcnBuilder().name(cost.name);
}

function replacementCapitalCostToBuilder(cost: ReplacementCapitalCost) {
    return new BcnBuilder().name(cost.name);
}

function omrCostToBuilder(cost: OMRCost) {
    return new BcnBuilder().name(cost.name);
}

function implementationContractCostToBuilder(cost: ImplementationContractCost) {
    return new BcnBuilder().name(cost.name);
}

function recurringContractCostToBuilder(cost: RecurringContractCost) {
    return new BcnBuilder().name(cost.name);
}

function otherCostToBuilder(cost: OtherCost) {
    return new BcnBuilder().name(cost.name);
}

function otherNonMonetaryCostToBuilder(cost: OtherNonMonetary) {
    return new BcnBuilder().name(cost.name);
}
