import type { Measures, Optional, Required } from "@lrd/e3-sdk";
import { FuelType, type ID } from "blcc-format/Format";
import { getOptionalTag } from "util/Util";

/*
 * Lifecycle Comparison
 */
export type LccComparisonRow = {
    name: string;
    baseline: boolean;
    initialCost: number;
    lifeCycleCost: number;
    energy: number;
    ghgEmissions: number;
    scc: number;
    lccScc: number;
};

export function createLccComparisonRows(
    measures: Measures[],
    alternativeNames: Map<ID, string>,
    baselineID: ID,
): LccComparisonRow[] {
    return measures.map(
        (measure): LccComparisonRow => ({
            name: alternativeNames.get(measure.altId) ?? "",
            baseline: measure.altId === baselineID,
            initialCost: measure.totalTagFlows["Initial Investment"],
            lifeCycleCost: measure.totalTagFlows.LCC,
            energy: measure.totalTagFlows.Energy,
            ghgEmissions: measure.totalTagFlows.Emissions,
            scc: measure.totalTagFlows.SCC,
            lccScc: measure.totalCosts,
        }),
    );
}

/*
 * Lifecycle Results to Baseline
 */
export type LccBaselineRow = {
    name: string;
    baseline: boolean;
    sir: number;
    airr: number;
    spp: number;
    dpp: number;
    initialCost: number;
    deltaEnergy: number;
    deltaGhg: number;
    deltaScc: number;
    netSavings: number;
};

export function createLccBaselineRows(measures: Measures[], names: Map<ID, string>, baselineID: ID): LccBaselineRow[] {
    const baseline = measures.find((measure) => measure.altId === baselineID);

    return measures.map((measure) => ({
        name: names.get(measure.altId) ?? "",
        baseline: measure.altId === baselineID,
        sir: measure.sir,
        airr: measure.airr,
        spp: measure.spp,
        dpp: measure.dpp,
        initialCost: measure.totalCosts,
        deltaEnergy: (baseline?.totalTagFlows.Energy ?? 0) - measure.totalTagFlows.Energy,
        deltaGhg: (baseline?.totalTagFlows.Emissions ?? 0) - measure.totalTagFlows.Emissions,
        deltaScc: (baseline?.totalTagFlows.SCC ?? 0) - measure.totalTagFlows.SCC,
        netSavings: measure.netSavings + measure.totalTagFlows.SCC,
    }));
}

/*
 * NPV Category/Sub-category
 */
export type CategorySubcategoryRow = {
    category: string;
    subcategory: string;
} & {
    [key: string]: number;
};

export function createNpvCategoryRow(measures: Measures[]): CategorySubcategoryRow[] {
    return [
        { category: "Investment", ...getOptionalTag(measures, "Initial Investment") },
        { category: "Energy", subcategory: "Consumption", ...getOptionalTag(measures, "Energy") },
        { subcategory: "Demand", ...getOptionalTag(measures, "Demand Charge") },
        { subcategory: "Rebates", ...getOptionalTag(measures, "Rebate") },
        { category: "Water", subcategory: "Usage" },
        { subcategory: "Disposal " },
        { category: "OMR", subcategory: "Recurring", ...getOptionalTag(measures, "OMR Recurring") },
        { subcategory: "Non-Recurring", ...getOptionalTag(measures, "OMR Non-Recurring") },
        { category: "Replacement", ...getOptionalTag(measures, "Replacement Capital") },
        { category: "Residual Value", ...getOptionalTag(measures, "Residual Value") },
    ] as CategorySubcategoryRow[]; //FIXME maybe there is a better way to type this
}

/*
 * Lifecycle Resource
 */
export function createLccResourceRows(measures: Measures[]): CategorySubcategoryRow[] {
    const consumption = [
        FuelType.ELECTRICITY,
        FuelType.NATURAL_GAS,
        FuelType.DISTILLATE_OIL,
        FuelType.RESIDUAL_OIL,
        FuelType.PROPANE,
        "Energy",
    ].map((fuelType) => getOptionalTag(measures, fuelType));

    const emissions = [
        FuelType.ELECTRICITY,
        FuelType.NATURAL_GAS,
        FuelType.DISTILLATE_OIL,
        FuelType.RESIDUAL_OIL,
        FuelType.PROPANE,
        "Emissions",
    ].map((fuelType) => getOptionalTag(measures, `${fuelType} Emissions`));

    return [
        { category: "Consumption", subcategory: FuelType.ELECTRICITY, ...consumption[0] },
        { subcategory: FuelType.NATURAL_GAS, ...consumption[1] },
        { subcategory: FuelType.DISTILLATE_OIL, ...consumption[2] },
        { subcategory: FuelType.RESIDUAL_OIL, ...consumption[3] },
        { subcategory: FuelType.PROPANE, ...consumption[4] },
        { subcategory: "Total", ...consumption[5] },
        { category: "Emissions", subcategory: FuelType.ELECTRICITY, ...emissions[0] },
        { subcategory: FuelType.NATURAL_GAS, ...emissions[1] },
        { subcategory: FuelType.DISTILLATE_OIL, ...emissions[2] },
        { subcategory: FuelType.RESIDUAL_OIL, ...emissions[3] },
        { subcategory: FuelType.PROPANE, ...emissions[4] },
        { subcategory: "Total", ...emissions[5] },
        { category: "Water", subcategory: "Use" }, //TODO: Add in water usage category
    ] as CategorySubcategoryRow[]; // FIXME there is probably a better way to type this
}

/*
 * Alternative NPV Cashflow
 */
export type AlternativeNpvCashflowRow = {
    year: number;
    investment: number;
    consumption: number;
    demand: number;
    rebates: number;
    waterUse: number;
    waterDisposal: number;
    recurring: number;
    nonRecurring: number;
    replace: number;
    residualValue: number;
    total: number;
};

export function createAlternativeNpvCashflowRow(
    allRequired: Required[],
    optionals: Map<string, Optional>,
    altID: ID,
): AlternativeNpvCashflowRow[] {
    const required = allRequired.find((req) => req.altId === altID);

    if (required === undefined) return [];

    const id = required.altId;
    const defaultArray = Array.apply(null, Array(required.totalCostsDiscounted.length)).map(() => 0);

    const investment = optionals.get(`${id} Initial Investment`)?.totalTagCashflowDiscounted ?? defaultArray;
    const consumption = optionals.get(`${id} Energy`)?.totalTagCashflowDiscounted ?? defaultArray;
    const recurring = optionals.get(`${id} OMR Recurring`)?.totalTagCashflowDiscounted ?? defaultArray;
    const nonRecurring = optionals.get(`${id} OMR Non-Recurring`)?.totalTagCashflowDiscounted ?? defaultArray;

    return required.totalCostsDiscounted.map(
        (total, i) =>
            ({
                year: i,
                investment: investment[i],
                consumption: consumption[i],
                recurring: recurring[i],
                nonRecurring: nonRecurring[i],
                total,
            }) as AlternativeNpvCashflowRow,
    );
}

/*
 * NPV Cashflow Comparison
 */
export type NpvCashflowComparisonRow = {
    key: number;
    year: number;
    [key: string]: number;
};

export function createNpvCashflowComparisonRow(allRequired: Required[]): NpvCashflowComparisonRow[] {
    const template = allRequired[0].totalCostsDiscounted;
    return template.map(
        (_, i) =>
            ({
                key: i,
                year: i,
                ...allRequired.reduce(
                    (acc, required, j) => {
                        acc[j.toString()] = required.totalCostsDiscounted[i];
                        return acc;
                    },
                    {} as { [key: string]: number },
                ),
            }) as NpvCashflowComparisonRow,
    );
}

/*
 * Alternative NPV Cashflow
 */
export type AlternativeNpvCashflowTotalRow = {
    category: string;
    subcategory: string;
    alternative: number;
};

export function createAlternativeNpvCashflowTotalRow(measure: Measures): AlternativeNpvCashflowTotalRow[] {
    return [
        { category: "Investment", alternative: measure.totalTagFlows["Initial Investment"] },
        { category: "Energy", subcategory: "Consumption", alternative: measure.totalTagFlows.Energy },
        { subcategory: "Demand" },
        { subcategory: "Rebates" },
        { category: "Water", subcategory: "Usage" },
        { subcategory: "Disposal " },
        { category: "OMR", subcategory: "Recurring", alternative: measure.totalTagFlows["OMR Recurring"] },
        { subcategory: "Non-Recurring", alternative: measure.totalTagFlows["OMR Non-Recurring"] },
        { category: "Replacement" },
        { category: "Residual Value" },
    ] as AlternativeNpvCashflowTotalRow[]; //FIXME this could be typed better
}

/*
 * Resource Usage
 */
export type ResourceUsageRow = {
    category: string;
    subcategory: string;
    consumption: number;
    emissions: number;
};

export function createResourceUsageRow(measure: Measures): ResourceUsageRow[] {
    const consumption = [
        FuelType.ELECTRICITY,
        FuelType.NATURAL_GAS,
        FuelType.DISTILLATE_OIL,
        FuelType.RESIDUAL_OIL,
        FuelType.PROPANE,
        "Energy",
    ].map((fuelType) => measure.totalTagFlows[fuelType]);

    const emissions = [
        FuelType.ELECTRICITY,
        FuelType.NATURAL_GAS,
        FuelType.DISTILLATE_OIL,
        FuelType.RESIDUAL_OIL,
        FuelType.PROPANE,
        "Energy",
    ].map((fuelType) => measure.totalTagFlows[fuelType]);

    return [
        {
            category: "Consumption",
            subcategory: FuelType.ELECTRICITY,
            consumption: consumption[0],
            emissions: emissions[0],
        },
        { subcategory: FuelType.NATURAL_GAS, consumption: consumption[1], emissions: emissions[1] },
        { subcategory: FuelType.DISTILLATE_OIL, consumption: consumption[2], emissions: emissions[2] },
        { subcategory: FuelType.RESIDUAL_OIL, consumption: consumption[3], emissions: emissions[3] },
        { subcategory: FuelType.PROPANE, consumption: consumption[4], emissions: emissions[4] },
        { subcategory: "Total", consumption: consumption[5], emissions: emissions[5] },
        { category: "Water", subcategory: "Use" },
    ] as ResourceUsageRow[]; //FIXME this could be typed better
}
