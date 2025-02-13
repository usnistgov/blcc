import type { Measures, Optional, Required } from "@lrd/e3-sdk";
import { EnergyUnit, FuelType, type ID, Unit } from "blcc-format/Format";
import { parseUnit } from "services/ConverterService";
import { getOptionalTag } from "util/Util";
import { getConvertMap, getConvertMapgJ as getConvertMapGJ } from "./UnitConversion";

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
            energy: getTotalEnergy(measure),
            ghgEmissions: measure.totalTagFlows.Emissions
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
    netSavings: number;
    lcc: number;
    deltaEnergy: number;
    deltaGhg: number;
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
        initialCost: measure.totalTagFlows["Initial Investment"],
        netSavings: measure.netSavings,
        lcc: measure.totalTagFlows.LCC,
        deltaEnergy: baseline == null ? 0 : getTotalEnergy(measure) - getTotalEnergy(baseline),
        deltaGhg: measure.totalTagFlows.Emissions - (baseline?.totalTagFlows.Emissions ?? 0),
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
        { category: "Contract", subcategory: "Recurring", ...getOptionalTag(measures, "Recurring Contract Cost")},
        { subcategory: "Implementation", ...getOptionalTag(measures, "Implementation Contract Cost")},
        { category: "Residual Value", ...getOptionalTag(measures, "Residual Value") },
        { category: "Total LCC", ...getOptionalTag(measures, "LCC")}
    ] as CategorySubcategoryRow[]; //FIXME maybe there is a better way to type this
}

/*
 * Lifecycle Resource
 */
export function createLccResourceRows(measures: Measures[]): CategorySubcategoryRow[] {
    const energy = [
        FuelType.ELECTRICITY,
        FuelType.NATURAL_GAS,
        FuelType.DISTILLATE_OIL,
        FuelType.RESIDUAL_OIL,
        FuelType.PROPANE
    ].map((fuelType) => getGJByFuelTypeForMeasures(measures, fuelType));

    const emissions = [
        FuelType.ELECTRICITY,
        FuelType.NATURAL_GAS,
        FuelType.DISTILLATE_OIL,
        FuelType.RESIDUAL_OIL,
        FuelType.PROPANE,
        "Emissions",
    ].map((fuelType) => getOptionalTag(measures, `${fuelType} Emissions`));

    return [
        { category: "Energy", subcategory: FuelType.ELECTRICITY, ...energy[0] },
        { subcategory: FuelType.NATURAL_GAS, ...energy[1] },
        { subcategory: FuelType.DISTILLATE_OIL, ...energy[2] },
        { subcategory: FuelType.RESIDUAL_OIL, ...energy[3] },
        { subcategory: FuelType.PROPANE, ...energy[4] },
        { subcategory: "Total", ...getTotalEnergyForMeasures(measures) },
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
    recurringContract: number;
    implementation: number;
    replace: number;
    residualValue: number;
    otherCosts: number;
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

    console.log(optionals);

    const investment = optionals.get(`${id} Initial Investment`)?.totalTagCashflowDiscounted ?? defaultArray;
    const consumption = optionals.get(`${id} Energy`)?.totalTagCashflowDiscounted ?? defaultArray;
    const demand = optionals.get(`${id} Demand Charge`)?.totalTagCashflowDiscounted ?? defaultArray;
    const recurring = optionals.get(`${id} OMR Recurring`)?.totalTagCashflowDiscounted ?? defaultArray;
    const nonRecurring = optionals.get(`${id} OMR Non-Recurring`)?.totalTagCashflowDiscounted ?? defaultArray;
    const recurringContract = optionals.get(`${id} Recurring Contract Cost`)?.totalTagCashflowDiscounted ?? defaultArray;
    const implementation = optionals.get(`${id} Implementation Contract Cost`)?.totalTagCashflowDiscounted ?? defaultArray;
    const replace = optionals.get(`${id} Replacement Capital`)?.totalTagCashflowDiscounted ?? defaultArray;
    const residualValue = optionals.get(`${id} Residual Value`)?.totalTagCashflowDiscounted ?? defaultArray;
    const otherCosts = optionals.get(`${id} Other`)?.totalTagCashflowDiscounted ?? defaultArray;

    return required.totalCostsDiscounted.map(
        (total, i) =>
            ({
                year: i,
                investment: investment[i],
                consumption: consumption[i],
                demand: demand[i],
                recurring: recurring[i],
                nonRecurring: nonRecurring[i],
                recurringContract: recurringContract[i],
                implementation: implementation[i],
                replace: replace[i],
                residualValue: residualValue[i],
                otherCosts: otherCosts[i],
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
export type AlternativeNpvCostTypeTotalRow = {
    category: string;
    subcategory: string;
    alternative: number;
};

export function createAlternativeNpvCostTypeTotalRow(measure: Measures): AlternativeNpvCostTypeTotalRow[] {
    return [
        { category: "Investment", alternative: measure.totalTagFlows["Initial Investment"] },
        { category: "Energy", subcategory: "Consumption", alternative: measure.totalTagFlows.Energy },
        { subcategory: "Demand" },
        { subcategory: "Rebates" },
        { category: "Water", subcategory: "Usage" },
        { subcategory: "Disposal " },
        { category: "OMR", subcategory: "Recurring", alternative: measure.totalTagFlows["OMR Recurring"] },
        { subcategory: "Non-Recurring", alternative: measure.totalTagFlows["OMR Non-Recurring"] },
        { category: "Replacement", alternative: measure.totalTagFlows["Replacement Capital"] },
        { category: "Contract", subcategory: "Recurring", alternative: measure.totalTagFlows["Recurring Contract Cost"]},
        { subcategory: "Implementation", alternative: measure.totalTagFlows["Implementation Contract Cost"]},
        { category: "Residual Value", alternative: measure.totalTagFlows["Residual Value"] },
        { category: "Other Monetary Costs", alternative: measure.totalTagFlows["Other"]}
    ] as AlternativeNpvCostTypeTotalRow[]; //FIXME this could be typed better
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
        FuelType.PROPANE
    ].map((fuelType) => getGJByFuelType(measure, fuelType));

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
            category: "Energy",
            subcategory: FuelType.ELECTRICITY,
            consumption: consumption[0],
            emissions: emissions[0],
        },
        { subcategory: FuelType.NATURAL_GAS, consumption: consumption[1], emissions: emissions[1] },
        { subcategory: FuelType.DISTILLATE_OIL, consumption: consumption[2], emissions: emissions[2] },
        { subcategory: FuelType.RESIDUAL_OIL, consumption: consumption[3], emissions: emissions[3] },
        { subcategory: FuelType.PROPANE, consumption: consumption[4], emissions: emissions[4] },
        { subcategory: "Total", consumption: getTotalEnergy(measure), emissions: emissions[5] },
        { category: "Water", subcategory: "Use" },
    ] as ResourceUsageRow[]; //FIXME this could be typed better
}

function getTotalEnergy(measure: Measures): number {
    let totalEnergy = 0;
    for (const energyUnit of Object.values(EnergyUnit)) {
        const amount: number = measure.quantitySum[energyUnit] ?? 0;
        if (amount > 0) {
            totalEnergy += getConvertMapGJ(FuelType.ELECTRICITY)[energyUnit]?.(amount) ?? 0;
        }
    }
    return totalEnergy;
}

function getGJByFuelType(measure: Measures, fuelType: string): number {
    const amount = measure.quantitySum[fuelType];
    const unit = parseUnit(measure.quantityUnits[fuelType]);
    return (amount != null && unit != null) ? (getConvertMapGJ(FuelType.ELECTRICITY)[unit]?.(amount) ?? 0) : 0;
}

function getTotalEnergyForMeasures(measures: Measures[]): { [key: string]: number } {
    const MWhByFuelType: { [key: string]: number } = {};
    for (let i = 0; i < measures.length; i++) {
        MWhByFuelType[i.toString()] = getTotalEnergy(measures[i]);
    }
    return MWhByFuelType;
}

function getGJByFuelTypeForMeasures(measures: Measures[], fuelType: string): { [key: string]: number } {
    const MWhByFuelType: { [key: string]: number } = {};
    for (let i = 0; i < measures.length; i++) {
        MWhByFuelType[i.toString()] = getGJByFuelType(measures[i], fuelType);
    }
    return MWhByFuelType;
}
