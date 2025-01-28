import { bind } from "@react-rxjs/core";
import { FuelType } from "blcc-format/Format";
import { alternatives$, baselineID$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import { combineLatest, from, switchMap, zip } from "rxjs";
import { map, toArray } from "rxjs/operators";
import { getOptionalTag } from "util/Util";

export type lccRow = {
    name: string;
    baseline: boolean;
    initialCost: string;
    lifeCycleCost: string;
    energy: string;
    ghgEmissions: string;
    scc: string;
    lccScc: string;
};

export type npvRow = {
    key: number;
    year: number;
    [key: string]: number;
};

export type lccBaselineRow = {
    airr: number;
    baseline: boolean;
    deltaEnergy: number;
    deltaGhg: number;
    deltaScc: number;
    dpp: number;
    initialCost: number;
    lifeCycleCost?: number; //has to be fixed once lifecycle cost is added to backend
    name: string | undefined;
    netSavings: number;
    sir: number;
    spp: number;
};

export type lccResourceRow = {
    category?: string;
    subcategory: string;
    [key: string]: string | undefined;
};

export type summary = {
    lccBaseline: lccBaselineRow[];
    lccResourceRows: lccResourceRow[];
    lccRows: lccRow[];
    npvCosts: { [key: string]: string }[];
};

// remove this once Luke pushes change
export type npvAllRow = {
    year: number;
    investment: number;
    consumption: number;
    recurring: number;
    nonRecurring: number;
    total: number;
};

{
    // remove previous and uncomment this
    // export type npvAllRow = {
    //     year: number;
    //     investment: number;
    //     consumption: number;
    //     demand: number;
    //     rebates: number;
    //     waterUse: number;
    //     waterDisposal: number;
    //     recurring: number;
    //     nonRecurring: number;
    //     replace: number;
    //     residualValue: number;
    //     total: number;
    // };
}

export type annualNPVComparisonRow = {
    key: number;
    year: number;
    [key: string]: string | number;
};

export type annual = {
    npvAll: npvAllRow[][];
    npvComparison: annualNPVComparisonRow[];
};

export type altNpvRow = {
    category?: string;
    subcategory?: string;
    alternative?: number;
};

export type resourceUsageRow = {
    category?: string;
    subcategory?: string;
    emissions?: number;
    consumption?: number;
};

export type altResults = {
    altNPV: altNpvRow[][];
    resourceUsage: resourceUsageRow[][];
};

const roundObjectValues = (obj: { [key: string | number]: string }) => {
    const roundedObj = {};
    for (const key in obj) {
        const value = obj[key];
        roundedObj[key] = typeof value === "number" ? value?.toFixed(2) : value; // Round only if it's a number
    }
    return roundedObj;
};

// summary
export const [useLCCRows, lccRows] = bind(
    combineLatest([ResultModel.measures$, ResultModel.alternativeNames$, baselineID$]).pipe(
        map(([measures, alternativeNames, baselineID]) =>
            measures.map(
                (measure) =>
                    ({
                        name: alternativeNames.get(measure.altId),
                        baseline: measure.altId === baselineID,
                        lifeCycleCost: measure.totalTagFlows.LCC?.toFixed(2),
                        initialCost: measure.totalTagFlows["Initial Investment"]?.toFixed(2),
                        energy: measure.totalTagFlows.Energy?.toFixed(2),
                        ghgEmissions: measure.totalTagFlows.Emissions?.toFixed(2),
                        scc: measure.totalTagFlows.SCC?.toFixed(2),
                        lccScc: measure.totalCosts?.toFixed(2)
                    } as lccRow)
            )
        )
    ),
    []
);

export const [useLCCBaseline, lccBaseline] = bind(
    combineLatest([ResultModel.measures$, ResultModel.alternativeNames$, baselineID$]).pipe(
        map(([measures, names, baselineID]) => {
            const baseline = measures.find((measure) => measure.altId === baselineID);

            return measures.map((measure) => ({
                name: names.get(measure.altId),
                baseline: measure.altId === baselineID,
                sir: measure.sir?.toFixed(2),
                airr: measure.airr?.toFixed(2),
                spp: measure.spp?.toFixed(2),
                dpp: measure.dpp?.toFixed(2),
                initialCost: measure.totalCosts.toFixed(2),
                deltaEnergy: ((baseline?.totalTagFlows.Energy ?? 0) - measure.totalTagFlows.Energy)?.toFixed(2),
                deltaGhg: ((baseline?.totalTagFlows.Emissions ?? 0) - measure.totalTagFlows.Emissions)?.toFixed(2),
                deltaScc: ((baseline?.totalTagFlows.SCC ?? 0) - measure.totalTagFlows.SCC)?.toFixed(2),
                netSavings: measure.netSavings + measure.totalTagFlows.SCC?.toFixed(2)
            }));
        })
    ),
    []
);

export const [useNPVCosts, npvCosts] = bind(
    combineLatest([ResultModel.measures$, ResultModel.alternativeNames$]).pipe(
        map(([measures]) => {
            console.log(measures);
            return [
                { category: "Investment", ...roundObjectValues(getOptionalTag(measures, "Initial Investment")) },
                {
                    category: "Energy",
                    subcategory: "Consumption",
                    ...roundObjectValues(getOptionalTag(measures, "Energy"))
                },
                { subcategory: "Demand", ...roundObjectValues(getOptionalTag(measures, "Demand Charge")) },
                { subcategory: "Rebates", ...roundObjectValues(getOptionalTag(measures, "Rebate")) },
                { category: "Water", subcategory: "Usage" },
                { subcategory: "Disposal " },
                {
                    category: "OMR",
                    subcategory: "Recurring",
                    ...roundObjectValues(getOptionalTag(measures, "OMR Recurring"))
                },
                { subcategory: "Non-Recurring", ...roundObjectValues(getOptionalTag(measures, "OMR Non-Recurring")) },
                { category: "Replacement", ...roundObjectValues(getOptionalTag(measures, "Replacement Capital")) },
                { category: "Residual Value", ...roundObjectValues(getOptionalTag(measures, "Residual Value")) }
            ];
        })
    ),
    []
);

export const [useLCCResourceRows, lccResourceRows] = bind(
    ResultModel.measures$.pipe(
        map((measures) => {
            const consumption = [
                FuelType.ELECTRICITY,
                FuelType.NATURAL_GAS,
                FuelType.DISTILLATE_OIL,
                FuelType.RESIDUAL_OIL,
                FuelType.PROPANE,
                "Energy"
            ].map((fuelType) => getOptionalTag(measures, fuelType));

            const emissions = [
                FuelType.ELECTRICITY,
                FuelType.NATURAL_GAS,
                FuelType.DISTILLATE_OIL,
                FuelType.RESIDUAL_OIL,
                FuelType.PROPANE,
                "Emissions"
            ].map((fuelType) => getOptionalTag(measures, `${fuelType} Emissions`));

            return [
                { category: "Consumption", subcategory: FuelType.ELECTRICITY, ...roundObjectValues(consumption[0]) },
                { subcategory: FuelType.NATURAL_GAS, ...roundObjectValues(consumption[1]) },
                { subcategory: FuelType.DISTILLATE_OIL, ...roundObjectValues(consumption[2]) },
                { subcategory: FuelType.RESIDUAL_OIL, ...roundObjectValues(consumption[3]) },
                { subcategory: FuelType.PROPANE, ...roundObjectValues(consumption[4]) },
                { subcategory: "Total", ...roundObjectValues(consumption[5]) },
                { category: "Emissions", subcategory: FuelType.ELECTRICITY, ...roundObjectValues(emissions[0]) },
                { subcategory: FuelType.NATURAL_GAS, ...roundObjectValues(emissions[1]) },
                { subcategory: FuelType.DISTILLATE_OIL, ...roundObjectValues(emissions[2]) },
                { subcategory: FuelType.RESIDUAL_OIL, ...roundObjectValues(emissions[3]) },
                { subcategory: FuelType.PROPANE, ...roundObjectValues(emissions[4]) },
                { subcategory: "Total", ...roundObjectValues(emissions[5]) },
                { category: "Water", subcategory: "Use" } //TODO: Add in water usage category
            ];
        })
    ),
    []
);

// annual
export const [useNPVComparison, npvComparison] = bind(
    ResultModel.required$.pipe(
        switchMap((required) =>
            zip(required.map((required) => from(required.totalCostsDiscounted))).pipe(
                map((values, year) => {
                    const result = { key: year, year } as npvRow;
                    values.forEach((value, i) => {
                        result[i.toString()] = Number(value?.toFixed(2));
                    });
                    return result;
                }),
                toArray()
            )
        )
    ),
    []
);

// @Luke to check
export const [useNpvAll, npvAll] = bind(
    combineLatest([ResultModel.required$, ResultModel.optionalsByTag$, ResultModel.selection$]).pipe(
        switchMap(([allRequired, optionals]) => {
            const defaultArray = Array(allRequired[0]?.totalCostsDiscounted.length).fill(0);
            const all = allRequired.map((req, index) => {
                const investment = from(
                    optionals.get(`${index} Initial Investment`)?.totalTagCashflowDiscounted ?? defaultArray
                );
                const consumption = from(optionals.get(`${index} Energy`)?.totalTagCashflowDiscounted ?? defaultArray);
                const recurring = from(
                    optionals.get(`${index} OMR Recurring`)?.totalTagCashflowDiscounted ?? defaultArray
                );
                const nonRecurring = from(
                    optionals.get(`${index} OMR Non-Recurring`)?.totalTagCashflowDiscounted ?? defaultArray
                );

                return zip(from(req.totalCostsDiscounted), investment, consumption, recurring, nonRecurring).pipe(
                    map((values, year) => ({
                        year,
                        investment: values[1]?.toFixed(2),
                        consumption: values[2]?.toFixed(2),
                        recurring: values[3]?.toFixed(2),
                        nonRecurring: values[4]?.toFixed(2),
                        total: values[0]?.toFixed(2)
                    })),
                    toArray()
                );
            });

            return combineLatest(all);
        })
    ),
    []
);

export const [useAnnualAltNPV, annualAltNPV] = bind(
    combineLatest([ResultModel.required$, ResultModel.optionalsByTag$, ResultModel.selection$]).pipe(
        switchMap(([allRequired, optionals, selectedID]) => {
            const required = allRequired.find((req) => req.altId === selectedID);

            if (required === undefined) return [];

            const id = required.altId;
            const defaultArray = Array.apply(null, Array(required.totalCostsDiscounted.length)).map(() => 0);

            return zip(
                from(required.totalCostsDiscounted),
                from(optionals.get(`${id} Initial Investment`)?.totalTagCashflowDiscounted ?? defaultArray),
                from(optionals.get(`${id} Energy`)?.totalTagCashflowDiscounted ?? defaultArray),
                from(optionals.get(`${id} OMR Recurring`)?.totalTagCashflowDiscounted ?? defaultArray),
                from(optionals.get(`${id} OMR Non-Recurring`)?.totalTagCashflowDiscounted ?? defaultArray)
            ).pipe(
                map(([total, investment, consumption, recurring, nonRecurring], year) => ({
                    year,
                    investment: investment?.toFixed(2),
                    consumption: consumption?.toFixed(2),
                    recurring: recurring?.toFixed(2),
                    nonRecurring: nonRecurring?.toFixed(2),
                    total: total?.toFixed(2)
                })),
                toArray()
            );
        })
    ),
    []
);

// alternative
export const [useAltNPV, altNPV] = bind(
    combineLatest([ResultModel.measures$]).pipe(
        map(([measure]) => {
            return measure.map((req) => [
                { category: "Investment", alternative: req.totalTagFlows["Initial Investment"]?.toFixed(2) },
                { category: "Energy", subcategory: "Consumption", alternative: req.totalTagFlows.Energy?.toFixed(2) },
                { subcategory: "Demand" },
                { subcategory: "Rebates" },
                { category: "Water", subcategory: "Usage" },
                { subcategory: "Disposal" },
                {
                    category: "OMR",
                    subcategory: "Recurring",
                    alternative: req.totalTagFlows["OMR Recurring"]?.toFixed(2)
                },
                { subcategory: "Non-Recurring", alternative: req.totalTagFlows["OMR Non-Recurring"]?.toFixed(2) },
                { category: "Replacement" },
                { category: "Residual Value" }
            ]);
        })
    ),
    []
);

export const [useResourceUsage, resourceUsage] = bind(
    combineLatest([ResultModel.measures$]).pipe(
        map(([measureArray]) => {
            return measureArray.map((measure) => {
                const fuelTypes = [
                    FuelType.ELECTRICITY,
                    FuelType.NATURAL_GAS,
                    FuelType.DISTILLATE_OIL,
                    FuelType.RESIDUAL_OIL,
                    FuelType.PROPANE,
                    "Energy"
                ];

                const consumption = fuelTypes.map((fuelType) => measure.totalTagFlows[fuelType]?.toFixed(2));
                const emissions = fuelTypes.map((fuelType) => measure.totalTagFlows[fuelType]?.toFixed(2));

                return [
                    {
                        category: "Consumption",
                        subcategory: FuelType.ELECTRICITY,
                        consumption: consumption[0],
                        emissions: emissions[0]
                    },
                    { subcategory: FuelType.NATURAL_GAS, consumption: consumption[1], emissions: emissions[1] },
                    { subcategory: FuelType.DISTILLATE_OIL, consumption: consumption[2], emissions: emissions[2] },
                    { subcategory: FuelType.RESIDUAL_OIL, consumption: consumption[3], emissions: emissions[3] },
                    { subcategory: FuelType.PROPANE, consumption: consumption[4], emissions: emissions[4] },
                    { subcategory: "Total", consumption: consumption[5], emissions: emissions[5] },
                    { category: "Water", subcategory: "Use" }
                ];
            });
        })
    ),
    []
);
