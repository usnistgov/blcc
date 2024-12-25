import { bind } from "@react-rxjs/core";
import { FuelType } from "blcc-format/Format";
import { alternatives$, baselineID$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import { combineLatest, from, switchMap, zip } from "rxjs";
import { map, toArray } from "rxjs/operators";
import { getOptionalTag } from "util/Util";

type LCCRow = {
    name: string;
    baseline: boolean;
    initialCost: number;
    lifeCycleCost: number;
    energy: number;
    ghgEmissions: number;
    scc: number;
    lccScc: number;
};

type npvRow = {
    key: number;
    year: number;
    [key: string]: number;
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
                        lifeCycleCost: measure.totalTagFlows.LCC,
                        initialCost: measure.totalTagFlows["Initial Investment"],
                        energy: measure.totalTagFlows.Energy,
                        ghgEmissions: measure.totalTagFlows.Emissions,
                        scc: measure.totalTagFlows.SCC,
                        lccScc: measure.totalCosts
                    } as LCCRow)
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
                sir: measure.sir,
                airr: measure.airr,
                spp: measure.spp,
                dpp: measure.dpp,
                initialCost: measure.totalCosts,
                deltaEnergy: (baseline?.totalTagFlows.Energy ?? 0) - measure.totalTagFlows.Energy,
                deltaGhg: (baseline?.totalTagFlows.Emissions ?? 0) - measure.totalTagFlows.Emissions,
                deltaScc: (baseline?.totalTagFlows.SCC ?? 0) - measure.totalTagFlows.SCC,
                netSavings: measure.netSavings + measure.totalTagFlows.SCC
            }));
        })
    ),
    []
);

export const [useNPVCosts, npvCosts] = bind(
    combineLatest([ResultModel.measures$, ResultModel.alternativeNames$]).pipe(
        map(([measures]) => {
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
                { category: "Residual Value", ...getOptionalTag(measures, "Residual Value") }
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
                        result[i.toString()] = value;
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
export const [useNpvAll, NpvAll] = bind(
    combineLatest([ResultModel.required$, ResultModel.optionalsByTag$, ResultModel.selection$]).pipe(
        switchMap(([allRequired, optionals]) => {
            const defaultArray = Array(allRequired[0].totalCostsDiscounted.length).fill(0);
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
                        investment: values[1],
                        consumption: values[2],
                        recurring: values[3],
                        nonRecurring: values[4],
                        total: values[0]
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
                    investment,
                    consumption,
                    recurring,
                    nonRecurring,
                    total
                })),
                toArray()
            );
        })
    ),
    []
);

// alternative
export const [useAltNPV, altNPV] = bind(
    combineLatest([ResultModel.selectedMeasure$]).pipe(
        map(([measure]) => {
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
                { category: "Residual Value" }
            ];
        })
    ),
    []
);

export const [useResourceUsage, resourceUsage] = bind(
    ResultModel.selectedMeasure$.pipe(
        map((measure) => {
            const consumption = [
                FuelType.ELECTRICITY,
                FuelType.NATURAL_GAS,
                FuelType.DISTILLATE_OIL,
                FuelType.RESIDUAL_OIL,
                FuelType.PROPANE,
                "Energy"
            ].map((fuelType) => measure.totalTagFlows[fuelType]);

            const emissions = [
                FuelType.ELECTRICITY,
                FuelType.NATURAL_GAS,
                FuelType.DISTILLATE_OIL,
                FuelType.RESIDUAL_OIL,
                FuelType.PROPANE,
                "Energy"
            ].map((fuelType) => measure.totalTagFlows[fuelType]);

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
        })
    ),
    []
);
