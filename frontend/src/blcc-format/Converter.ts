/* eslint @typescript-eslint/no-explicit-any: 0 */

import { createSignal } from "@react-rxjs/utils";
import {
    AnalysisType,
    type CapitalCost,
    CostTypes,
    CubicUnit,
    type CustomerSector,
    DiscountingMethod,
    DollarMethod,
    DollarOrPercent,
    type EnergyCost,
    EnergyUnit,
    FuelType,
    type ID,
    type ImplementationContractCost,
    LiquidUnit,
    type OMRCost,
    Purpose,
    type RecurringContractCost,
    type ReplacementCapitalCost,
    type ResidualValue,
    Season,
    type SeasonUsage,
    SocialCostOfGhgScenario,
    type USLocation,
    type Unit,
    type WaterCost,
    WeightUnit, Case
} from "blcc-format/Format";
import { Version } from "blcc-format/Verison";
import { showMessage } from "components/modal/MessageModal";
import { Country, stateToAbbreviation } from "constants/LOCATION";
import { XMLParser } from "fast-xml-parser";
import { Model } from "model/Model";
import { db } from "model/db";
import objectHash from "object-hash";
import { Subject, map, switchMap } from "rxjs";
import { withLatestFrom } from "rxjs/operators";

const yearRegex = /(?<years>\d+) years* (?<months>\d+) months*( (?<days>\d+) days*)*/;
const parser = new XMLParser();

const [converted$, convert] = createSignal<File>();

export { convert };

/**
 * A RXJS operator to convert an XML string representing an old BLCC format file and converting it into the new
 * JSON format.
 */
converted$
    .pipe(
        switchMap((file) => {
            const result$ = new Subject<string>();

            // Read file
            const reader = new FileReader();
            reader.onload = function () {
                result$.next(this.result as string);
            };
            reader.readAsText(file);

            return result$;
        }),
        map((xml) => parser.parse(xml)),
        withLatestFrom(Model.defaultReleaseYear$),
    )
    .subscribe(async ([obj, releaseYear]) => {
        const project = obj.Project;

        const alternativeObjectOrArray = project.Alternatives.Alternative;
        const alternatives = Array.isArray(alternativeObjectOrArray)
            ? alternativeObjectOrArray
            : [alternativeObjectOrArray];

        const studyPeriod = parseStudyPeriod(parseYears(project.Duration));

        const [newAlternatives, newCosts] = await parseAlternativesAndHashCosts(alternatives, studyPeriod);

        db.projects.add({
            version: Version.V1,
            name: project.Name,
            description: project.Comment,
            analyst: project.Analyst,
            analysisType: convertAnalysisType(project.AnalysisType),
            purpose: convertAnalysisPurpose(project.AnalysisPurpose),
            dollarMethod: convertDollarMethod(project.DollarMethod),
            studyPeriod,
            case: Case.REF,
            constructionPeriod: (parseYears(project.PCPeriod) as { type: "Year"; value: number }).value,
            discountingMethod: convertDiscountMethod(project.DiscountingMethod),
            realDiscountRate: project.DiscountRate,
            nominalDiscountRate: undefined,
            inflationRate: project.InflationRate,
            location: parseLocation(project.Location),
            alternatives: newAlternatives,
            costs: newCosts,
            ghg: {
                socialCostOfGhgScenario: SocialCostOfGhgScenario.NONE,
            },
            releaseYear,
        });

        showMessage(
            "Old Format Conversion",
            "Files from the previous version of BLCC must be converted to the new format. Some options are not able to be converted and must be checked manually. Double check converted files for correctness.",
        );
    });

function parseStudyPeriod(studyPeriod: DateDiff) {
    switch (studyPeriod.type) {
        case "Remaining":
            return 0;
        case "Year":
            return studyPeriod.value;
    }
}

type DateDiff = { type: "Remaining" } | { type: "Year"; value: number };

function parseYears(value: string): DateDiff {
    if (value === "Remaining") return { type: "Remaining" };

    const exec = yearRegex.exec(value);
    if (exec !== null) return { type: "Year", value: Number.parseInt(exec.groups?.years ?? "0") };

    return { type: "Year", value: 1 };
}

function convertAnalysisType(old: number) {
    switch (old) {
        case 0:
            return AnalysisType.FEMP_ENERGY;
        case 1:
            return AnalysisType.FEDERAL_FINANCED;
        case 2:
            return AnalysisType.MILCON_ENERGY;
        case 3:
            return AnalysisType.MILCON_ECIP;
        case 4:
            return AnalysisType.OMB_NON_ENERGY;
        case 5:
            return AnalysisType.MILCON_NON_ENERGY;
        default:
            return AnalysisType.FEMP_ENERGY;
    }
}

function convertAnalysisPurpose(old: number) {
    switch (old) {
        case 0:
            return Purpose.INVEST_REGULATION;
        case 1:
            return Purpose.COST_LEASE;
        default:
            return undefined;
    }
}

function convertDollarMethod(old: number) {
    switch (old) {
        case 1:
            return DollarMethod.CURRENT;
        default:
            return DollarMethod.CONSTANT;
    }
}

function convertDiscountMethod(old: number) {
    switch (old) {
        case 2:
            return DiscountingMethod.MID_YEAR;
        default:
            return DiscountingMethod.END_OF_YEAR;
    }
}

function parseLocation(old: string | undefined): USLocation {
    if (old === undefined) return { country: Country.USA };

    return {
        country: Country.USA,
        state: stateToAbbreviation[old],
        city: undefined,
        zipcode: undefined,
    };
}

// biome-ignore lint: No need to type the XML format
function extractCosts(alternative: any, name: CostComponent) {
    const componentOrArray = alternative[`${name}s`]?.[name] ?? [];
    const arrayOfComponents = Array.isArray(componentOrArray) ? componentOrArray : [componentOrArray];

    return arrayOfComponents.map((x: object) => {
        return {
            type: name,
            ...x,
        };
    });
}

type CostComponent =
    | "CapitalComponent"
    | "EnergyUsage"
    | "WaterUsage"
    | "RecurringContractCost"
    | "NonRecurringContractCost"
    | "CapitalReplacement"
    | "RecurringCost"
    | "NonRecurringCost";

// biome-ignore lint: No need to type XML format
async function parseAlternativesAndHashCosts(alternatives: any[], studyPeriod: number): Promise<[ID[], ID[]]> {
    const costCache = new Map<string, ID>();

    const newAlternatives = await Promise.all(
        alternatives.map(async (alternative) => {
            const capitalComponents = extractCosts(alternative, "CapitalComponent");

            const costs = [
                ...capitalComponents,
                ...capitalComponents.flatMap((capitalComponent) => {
                    //biome-ignore lint: No need to type the XML format
                    const rename = renameSubComponent((capitalComponent as any).Name);

                    return [
                        ...extractCosts(capitalComponent, "CapitalReplacement").map(rename),
                        ...extractCosts(capitalComponent, "RecurringCost").map(rename),
                        ...extractCosts(capitalComponent, "NonRecurringCost").map(rename),
                    ];
                }),
                ...extractCosts(alternative, "EnergyUsage"),
                ...extractCosts(alternative, "WaterUsage"),
                ...extractCosts(alternative, "RecurringContractCost"),
                ...extractCosts(alternative, "NonRecurringContractCost"),
            ];

            for (const cost of costs) {
                const hash = objectHash(cost);
                const costID = await convertCost(cost, studyPeriod);

                if (!costCache.has(hash)) costCache.set(hash, costID);
            }

            return db.alternatives.add({
                name: alternative.Name,
                description: alternative.Comment,
                costs: costs.map((cost) => costCache.get(objectHash(cost)) ?? -1),
            });
        }),
    );

    return [newAlternatives, [...costCache.values()]];
}

function renameSubComponent(name: string) {
    // biome-ignore lint: No need to type XML format
    return (subCost: any) => {
        subCost.Name = `${name} ${subCost.Name}`;
        return subCost;
    };
}

// biome-ignore lint: No need to type XML format
async function convertCost(cost: any, studyPeriod: number) {
    const type: CostComponent = cost.type;
    switch (type) {
        case "CapitalReplacement":
            return db.costs.add({
                name: cost.Name,
                description: cost.Comment ?? undefined,
                type: CostTypes.REPLACEMENT_CAPITAL,
                initialCost: cost.InitialCost,
                annualRateOfChange: parseEscalation(cost.Escalation, studyPeriod),
                expectedLife: (parseYears(cost.Duration) as { type: "Year"; value: number }).value,
                residualValue: {
                    approach: DollarOrPercent.PERCENT,
                    value: cost.ResaleValueFactor,
                },
            } as ReplacementCapitalCost);
        case "NonRecurringCost":
            return db.costs.add({
                name: cost.Name,
                description: cost.Comment ?? undefined,
                type: CostTypes.REPLACEMENT_CAPITAL,
                initialCost: cost.Amount,
                annualRateOfChange: parseEscalation(cost.Escalation, studyPeriod),
                residualValue: undefined,
            } as ReplacementCapitalCost);
        case "RecurringCost":
            return db.costs.add({
                name: cost.Name,
                description: cost.Comment ?? undefined,
                type: CostTypes.OMR,
                initialCost: cost.Amount,
                initialOccurrence: initialFromUseIndex(cost.Index, studyPeriod), // (parseYears(cost["Start"]) as { type: "Year"; value: number }).value,
                annualRateOfChange: parseEscalation(cost.Escalation, studyPeriod),
                rateOfRecurrence: 1, //parseUseIndex(cost["Index"], studyPeriod)
            } as OMRCost);
        case "CapitalComponent":
            return db.costs.add({
                name: cost.Name,
                description: cost.Comment ?? undefined,
                type: CostTypes.CAPITAL,
                initialCost: cost.InitialCost ?? 0,
                amountFinanced: cost.AmountFinanced,
                annualRateOfChange: undefined,
                expectedLife: (parseYears(cost.Duration) as { type: "Year"; value: number }).value,
                costAdjustment: parseEscalation(cost.Escalation, studyPeriod),
                phaseIn: parsePhaseIn(cost, studyPeriod),
                residualValue: cost.ResaleValueFactor
                    ? ({
                          approach: DollarOrPercent.PERCENT,
                          value: cost.ResaleValueFactor as number,
                      } as ResidualValue)
                    : undefined,
            } as CapitalCost);
        case "EnergyUsage":
            return db.costs.add({
                name: cost.Name,
                description: cost.Comment ?? undefined,
                type: CostTypes.ENERGY,
                fuelType: parseFuelType(cost.FuelType),
                customerSector: cost.RateSchedule as CustomerSector,
                location: parseLocation(cost.State),
                costPerUnit: cost.UnitCost as number,
                annualConsumption: cost.YearlyUsage as number,
                unit: parseUnit(cost.Units),
                demandCharge: cost.DemandCharge as number,
                rebate: cost.UtilityRebate as number,
                escalation: parseEscalation(cost, studyPeriod),
                useIndex: parseUseIndex(cost.UsageIndex, studyPeriod),
            } as EnergyCost);
        case "WaterUsage":
            return db.costs.add({
                name: cost.Name,
                description: cost.Comment ?? undefined,
                type: CostTypes.WATER,
                unit: parseUnit(cost.Units),
                usage: parseSeasonalUsage(cost, "Usage"),
                disposal: parseSeasonalUsage(cost, "Disposal"),
                escalation: parseEscalation(cost.UsageEscalation, studyPeriod),
                useIndex: parseUseIndex(cost.UsageIndex, studyPeriod),
                disposalIndex: parseUseIndex(cost.DisposalIndex, studyPeriod),
            } as WaterCost);
        case "RecurringContractCost":
            return db.costs.add({
                name: cost.Name,
                description: cost.Comment ?? undefined,
                type: CostTypes.RECURRING_CONTRACT,
                initialCost: cost.Amount,
                initialOccurrence: (parseYears(cost.Start) as { type: "Year"; value: number }).value,
                annualRateOfChange: parseEscalation(cost.Escalation, studyPeriod),
                rateOfRecurrence: (parseYears(cost.Interval) as { type: "Year"; value: number }).value,
            } as RecurringContractCost);
        case "NonRecurringContractCost":
            return db.costs.add({
                name: cost.Name,
                description: cost.Comment ?? undefined,
                type: CostTypes.IMPLEMENTATION_CONTRACT,
                cost: cost.Amount,
                occurrence: (parseYears(cost.Start) as { type: "Year"; value: number }).value,
            } as ImplementationContractCost);
    }
}

function parseFuelType(fuelType: string): FuelType {
    switch (fuelType) {
        case "Electricity":
            return FuelType.ELECTRICITY;
        case "NatGas":
            return FuelType.NATURAL_GAS;
        case "LPG":
            return FuelType.PROPANE;
        case "DistOil":
            return FuelType.DISTILLATE_OIL;
        case "ResidOil":
            return FuelType.RESIDUAL_OIL;
        default:
            return FuelType.OTHER;
    }
}

function parseUnit(unit: string): Unit | undefined {
    switch (unit) {
        //Energy
        case "kWh":
            return EnergyUnit.KWH;
        case "GJ":
            return EnergyUnit.GJ;
        case "MJ":
            return EnergyUnit.MJ;
        case "Therm":
            return EnergyUnit.THERM;
        case "MBtu":
            return EnergyUnit.MBTU;

        // Volume
        case "Liter":
            return LiquidUnit.LITER;
        case "1,000 Liter":
            return LiquidUnit.K_LITER;
        case "Gallon":
            return LiquidUnit.GALLON;
        case "1,000 Gallon":
            return LiquidUnit.K_GALLON;
        case "Cubic Meters":
            return CubicUnit.CUBIC_METERS;
        case "Cubic Feet":
            return CubicUnit.CUBIC_FEET;

        // Weight
        case "kg":
            return WeightUnit.KG;
        case "Pound":
            return WeightUnit.POUND;
    }

    return undefined;
}

// biome-ignore lint: No need to type XML format
function parseSeason(cost: any, season: Season, category: string): SeasonUsage {
    return {
        season: season,
        amount: cost[`${season}Yearly${category}`],
        costPerUnit: cost[`${season}${category}UnitCost`],
    };
}

// biome-ignore lint: No need to type XML format
function parseSeasonalUsage(cost: any, category: string): SeasonUsage[] {
    return [parseSeason(cost, Season.WINTER, "Usage"), parseSeason(cost, Season.SUMMER, category)];
}

/**
 * Converts a single number into an array or splits the portions by a comma.
 *
 * @param portion The portion value to parse that can be either a number of a comma separated list.
 */
// biome-ignore lint: No need to type XML format
function parsePortions(portion: any) {
    if (typeof portion === "number") return [portion];

    return portion.split(",").map((value: string) => Number.parseFloat(value));
}

/**
 * Parses the PhaseIn section of a cost.
 *
 * @param cost The cost to get the PhaseIn from.
 * @param studyPeriod The length of the study period for the current project.
 */
// biome-ignore lint: No need to type XML format
function parsePhaseIn(cost: any, studyPeriod: number): number[] | undefined {
    const result = Array<number>(studyPeriod).fill(0);
    const phaseIn = cost.PhaseIn.PhaseIn;

    const portions = parsePortions(phaseIn.Portions);
    const intervals = phaseIn.Intervals.split(",").map((value: string) => parseYears(value));

    // Convert portion intervals into year by year percentages
    let stride = 0;
    for (let i = 0; i < portions.length; i++) {
        const portion = portions[i];
        const interval = intervals[i];

        for (let j = stride; j < stride + interval; j++) {
            result[j] = portion / interval;
        }

        stride += interval;
    }

    // Return undefined if all the values are zero, otherwise return array.
    if (result.find((value) => value !== 0) === undefined) return undefined;

    return result;
}

// biome-ignore lint: No need to type XML format
function parseVarying(intervals: any, values: any, studyPeriod: number): number | number[] | undefined {
    // If the only interval is remaining, use a constant index.
    if (intervals === "Remaining") return values;

    const portions = parsePortions(values);
    const dateDiffs: DateDiff[] = intervals.split(",").map((value: string) => parseYears(value));

    const length = portions.length > studyPeriod + 1 ? portions.length : studyPeriod + 1;
    const result = Array<number>(length).fill(0);

    // Convert value intervals into year by year percentages
    let stride = 0;
    for (let i = 0; i < portions.length; i++) {
        const portion = portions[i];
        const interval = dateDiffs[i];

        switch (interval.type) {
            case "Year": {
                for (let j = stride; j < stride + interval.value; j++) {
                    result[j] = portion;
                }
                stride += interval.value;
                break;
            }
            case "Remaining": {
                for (let j = stride; j < result.length; j++) {
                    result[j] = portion;
                }
                break;
            }
        }
    }

    // Return undefined if all the values are zero, otherwise return array.
    if (result.find((value) => value !== 0) === undefined) return undefined;

    return result;
}

//biome-ignore lint: No need to type XML format
function parseUseIndex(cost: any, studyPeriod: number): number | number[] | undefined {
    const useIndex = cost.UsageIndex;
    return parseVarying(useIndex.Intervals, useIndex.Values, studyPeriod);
}

//biome-ignore lint: No need to type XML format
function initialFromUseIndex(cost: any, studyPeriod: number): number {
    return initialFromVarying(parseUseIndex(cost, studyPeriod));
}

function initialFromVarying(values: number | number[] | undefined): number {
    if (!Array.isArray(values) || values === undefined) return 1;

    return values.findIndex((value) => value !== 0) + 1;
}

//biome-ignore lint: No need to type XML format
function parseEscalation(escalation: any, studyPeriod: number): number | number[] | undefined {
    if (!escalation) return undefined;

    const type = Object.keys(escalation)[0];

    switch (type) {
        case "SimpleEscalation": {
            const value = Number.parseFloat(escalation[type].Rate);
            return Number.isNaN(value) ? undefined : value;
        }
        case "VaryingEscalation": {
            const varying = escalation[type];
            return parseVarying(varying.Intervals, varying.Values, studyPeriod);
        }
    }
}
