import type { Measures, Optional, Required } from "@lrd/e3-sdk";
import { EnergyUnit, FuelType, type ID } from "blcc-format/Format";
import { getOptionalTag, getQuantitySumTag } from "util/Util";
import { getConvertMapgJ as getConvertMapGJ } from "./UnitConversion";
import { parseUnit } from "services/ConverterService";

/*
 * Summary - Lifecycle Comparison
 */
export type LccComparisonRow = {
    name: string;
    baseline: boolean;
    investment: number;
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
            investment: measure.totalTagFlows["Initial Investment"],
            lifeCycleCost: measure.totalTagFlows.LCC,
            energy: getTotalEnergy(measure),
            ghgEmissions: measure.totalTagFlows.Emissions,
        }),
    );
}

/*
 * Summary - Lifecycle Results to Baseline
 */
export type LccBaselineRow = {
    name: string;
    baseline: boolean;
    sir: number;
    airr: number;
    spp: number;
    dpp: number;
    investment: number;
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
        investment: measure.totalTagFlows["Initial Investment"],
        netSavings: measure.netSavings,
        lcc: measure.totalTagFlows.LCC,
        deltaEnergy: baseline == null ? 0 : getTotalEnergy(measure) - getTotalEnergy(baseline),
        deltaGhg: measure.totalTagFlows.Emissions - (baseline?.totalTagFlows.Emissions ?? 0),
    }));
}

/*
 * Summary - NPV Category/Sub-category
 */
export type CategorySubcategoryRow = {
    category: string;
    subcategory: string;
} & {
    [key: string]: number;
};

export function createNpvCategoryRow(measures: Measures[]): CategorySubcategoryRow[] {
    return [
        { category: "Energy", subcategory: "Consumption", ...getOptionalTag(measures, "Energy") },
        { subcategory: "Demand", ...getOptionalTag(measures, "Demand Charge") },
        { subcategory: "Rebates", ...getOptionalTag(measures, "Rebate") },
        { category: "Water", subcategory: "Usage", ...getOptionalTag(measures, "Usage") },
        { subcategory: "Disposal", ...getOptionalTag(measures, "Disposal") },
        {
            category: "Capital Components",
            subcategory: "Investment",
            ...getOptionalTag(measures, "Initial Investment"),
        },
        { subcategory: "OMR", ...getOptionalTag(measures, "OMR") },
        { subcategory: "Replacement", ...getOptionalTag(measures, "Replacement Capital") },
        { subcategory: "Residual Value", ...getOptionalTag(measures, "Residual Value") },
        {
            category: "Contract",
            subcategory: "Non-Recurring",
            ...getOptionalTag(measures, "Implementation Contract Cost"),
        },
        { subcategory: "Recurring", ...getOptionalTag(measures, "Recurring Contract Cost") },
        { category: "Other", subcategory: "Monetary", ...getOptionalTag(measures, "Other") },
        { category: "Total LCC", ...getOptionalTag(measures, "LCC") },
    ] as CategorySubcategoryRow[]; //FIXME maybe there is a better way to type this
}

/*
 * Summary - Lifecycle Resource
 */
export type LCCResourceRow = {
    category: string;
    subcategory: string;
    units?: "gJ" | "kg CO2e" | "Liter(s)";
} & {
    [key: string]: number;
};

export function createLccResourceRows(measures: Measures[]): LCCResourceRow[] {
    const energy = [
        FuelType.ELECTRICITY,
        FuelType.NATURAL_GAS,
        FuelType.DISTILLATE_OIL,
        FuelType.RESIDUAL_OIL,
        FuelType.PROPANE,
        FuelType.COAL,
    ].map((fuelType) => getGJByFuelTypeForMeasures(measures, fuelType));

    const emissions = [
        FuelType.ELECTRICITY,
        FuelType.NATURAL_GAS,
        FuelType.DISTILLATE_OIL,
        FuelType.RESIDUAL_OIL,
        FuelType.PROPANE,
        FuelType.COAL,
        "Total",
    ].map((fuelType) => getQuantitySumTag(measures, fuelType === "Total" ? "Emissions" : `${fuelType} Emissions`));

    return [
        { category: "Energy", subcategory: FuelType.ELECTRICITY, units: "gJ", ...energy[0] },
        { subcategory: FuelType.NATURAL_GAS, units: "gJ", ...energy[1] },
        { subcategory: FuelType.DISTILLATE_OIL, units: "gJ", ...energy[2] },
        { subcategory: FuelType.RESIDUAL_OIL, units: "gJ", ...energy[3] },
        { subcategory: FuelType.PROPANE, units: "gJ", ...energy[4] },
        { subcategory: FuelType.COAL, units: "gJ", ...energy[5] },
        { subcategory: "Total", units: "gJ", ...getTotalEnergyForMeasures(measures) },
        { category: "Emissions", subcategory: FuelType.ELECTRICITY, units: "kg CO2e", ...emissions[0] },
        { subcategory: FuelType.NATURAL_GAS, units: "kg CO2e", ...emissions[1] },
        { subcategory: FuelType.DISTILLATE_OIL, units: "kg CO2e", ...emissions[2] },
        { subcategory: FuelType.RESIDUAL_OIL, units: "kg CO2e", ...emissions[3] },
        { subcategory: FuelType.PROPANE, units: "kg CO2e", ...emissions[4] },
        { subcategory: FuelType.COAL, units: "kg CO2e", ...emissions[5] },
        { subcategory: "Total", units: "kg CO2e", ...emissions[6] },
        { category: "Water", subcategory: "Use", units: "Liter(s)", ...getQuantitySumTag(measures, "Usage") },
        { subcategory: "Disposal", units: "Liter(s)", ...getQuantitySumTag(measures, "Disposal") }, //TODO: Add in water usage category
    ] as LCCResourceRow[]; // FIXME there is probably a better way to type this
}

/*
 * Annual - Cost Type NPV Cashflow
 */
export type AnnualCostTypeNpvCashflowRow = {
    year: number;
    investment: number;
    consumption: number;
    demand: number;
    rebates: number;
    waterUse: number;
    waterDisposal: number;
    omr: number;
    recurringContract: number;
    implementation: number;
    replace: number;
    residualValue: number;
    otherCosts: number;
    total: number;
};

export function createAnnualCostTypeNpvCashflowRow(
    allRequired: Required[],
    optionals: Map<string, Optional>,
    altID: ID,
    discountedCashFlow: boolean,
): AnnualCostTypeNpvCashflowRow[] {
    const required = allRequired.find((req) => req.altId === altID);

    if (required === undefined) return [];

    const id = required.altId;
    const defaultArray = Array.apply(null, Array(required.totalCostsDiscounted.length)).map(() => 0);

    const investment = getOptionals(`${id} Initial Investment`, optionals, discountedCashFlow, defaultArray);
    const consumption = getOptionals(`${id} Energy`, optionals, discountedCashFlow, defaultArray);
    const demand = getOptionals(`${id} Demand Charge`, optionals, discountedCashFlow, defaultArray);
    const rebates = getOptionals(`${id} Rebate`, optionals, discountedCashFlow, defaultArray);
    const waterUse = getOptionals(`${id} Usage`, optionals, discountedCashFlow, defaultArray);
    const waterDisposal = getOptionals(`${id} Disposal`, optionals, discountedCashFlow, defaultArray);
    const omr = getOptionals(`${id} OMR`, optionals, discountedCashFlow, defaultArray);
    const recurringContract = getOptionals(
        `${id} Recurring Contract Cost`,
        optionals,
        discountedCashFlow,
        defaultArray,
    );
    const implementation = getOptionals(
        `${id} Implementation Contract Cost`,
        optionals,
        discountedCashFlow,
        defaultArray,
    );
    const replace = getOptionals(`${id} Replacement Capital`, optionals, discountedCashFlow, defaultArray);
    const residualValue = getOptionals(`${id} Residual Value`, optionals, discountedCashFlow, defaultArray);
    const otherCosts = getOptionals(`${id} Other`, optionals, discountedCashFlow, defaultArray);

    const requiredCosts = discountedCashFlow ? required.totalCostsDiscounted : required.totalCostsNonDiscounted;
    return requiredCosts.map(
        (total, i) =>
            ({
                year: i,
                investment: investment[i],
                consumption: consumption[i],
                demand: demand[i],
                rebates: rebates[i],
                waterUse: waterUse[i],
                waterDisposal: waterDisposal[i],
                omr: omr[i],
                recurringContract: recurringContract[i],
                implementation: implementation[i],
                replace: replace[i],
                residualValue: residualValue[i],
                otherCosts: otherCosts[i],
                total,
            }) as AnnualCostTypeNpvCashflowRow,
    );
}

function getOptionals(
    tag: string,
    optionals: Map<string, Optional>,
    discounted: boolean,
    defaultArray: number[],
): number[] {
    return (
        (discounted
            ? optionals.get(tag)?.totalTagCashflowDiscounted
            : optionals.get(tag)?.totalTagCashflowNonDiscounted) ?? defaultArray
    );
}

/*
 * Annual - NPV Cashflow Comparison
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
 * Alternative - Alternative NPV Cashflow
 */
export type AlternativeNpvCostTypeTotalRow = {
    category: string;
    subcategory: string;
    alternative: number;
};

export function createAlternativeNpvCostTypeTotalRow(measure: Measures): AlternativeNpvCostTypeTotalRow[] {
    return [
        { category: "Energy", subcategory: "Consumption", alternative: measure.totalTagFlows.Energy },
        { subcategory: "Demand", alternative: measure.totalTagFlows["Demand Charge"] },
        { subcategory: "Rebates", alternative: measure.totalTagFlows.Rebate },
        { category: "Water", subcategory: "Usage", alternative: measure.totalTagFlows.Usage },
        { subcategory: "Disposal ", alternative: measure.totalTagFlows.Disposal },
        {
            category: "Capital Components",
            subcategory: "Investment",
            alternative: measure.totalTagFlows["Initial Investment"],
        },
        { subcategory: "OMR", alternative: measure.totalTagFlows.OMR },
        { subcategory: "Replacement", alternative: measure.totalTagFlows["Replacement Capital"] },
        { subcategory: "Residual Value", alternative: measure.totalTagFlows["Residual Value"] },
        {
            category: "Contract",
            subcategory: "Non-Recurring",
            alternative: measure.totalTagFlows["Implementation Contract Cost"],
        },
        { subcategory: "Recurring", alternative: measure.totalTagFlows["Recurring Contract Cost"] },
        { category: "Other", subcategory: "Monetary", alternative: measure.totalTagFlows.Other },
    ] as AlternativeNpvCostTypeTotalRow[]; //FIXME this could be typed better
}

/*
 * Alternative - Resource Usage
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
        FuelType.COAL,
    ].map((fuelType) => getGJByFuelType(measure, fuelType));

    const emissions = [
        FuelType.ELECTRICITY,
        FuelType.NATURAL_GAS,
        FuelType.DISTILLATE_OIL,
        FuelType.RESIDUAL_OIL,
        FuelType.PROPANE,
        FuelType.COAL,
        "Energy",
    ].map((fuelType) => measure.quantitySum[fuelType] ?? 0);

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
        { subcategory: FuelType.COAL, consumption: consumption[5], emissions: emissions[5] },
        { subcategory: "Total", consumption: getTotalEnergy(measure), emissions: emissions[6] },
        { category: "Water", subcategory: "Use", consumption: measure.quantitySum.Usage },
    ] as ResourceUsageRow[]; //FIXME this could be typed better
}

function getTotalEnergy(measure: Measures): number {
    let totalEnergy = 0;
    for (const energyUnit of Object.values(EnergyUnit)) {
        const amount: number = measure.quantitySum[energyUnit] ?? 0;
        if (amount !== 0) {
            totalEnergy += getConvertMapGJ(FuelType.ELECTRICITY)[energyUnit]?.(amount) ?? 0;
        }
    }
    return totalEnergy;
}

export function getGJByFuelType(measure: Measures, fuelType: string): number {
    const amount = measure.quantitySum[fuelType];
    const unit = parseUnit(measure.quantityUnits[fuelType]);
    return amount != null && unit != null ? (getConvertMapGJ(FuelType.ELECTRICITY)[unit]?.(amount) ?? 0) : 0;
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
