import { XMLParser } from "fast-xml-parser";
import { map, pipe } from "rxjs";
import {
    Alternative,
    AnalysisType,
    Cost,
    CubicUnit,
    DiscountingMethod,
    DollarMethod,
    EnergyUnit,
    FuelType,
    LiquidUnit,
    Project,
    Purpose,
    Season,
    SeasonUsage,
    Unit,
    USLocation,
    WeightUnit
} from "./Format";
import { Version } from "./Verison";
import objectHash from "object-hash";

const yearRegex = /(?<years>\d+) years* (?<months>\d+) months*( (?<days>\d+) days*)*/;
const parser = new XMLParser();

export function convert() {
    return pipe(
        map((xml) => parser.parse(xml)),
        map((obj) => {
            console.log(obj);

            const project = obj["Project"];

            const alternativeObjectOrArray = project["Alternatives"]["Alternative"];
            const alternatives = Array.isArray(alternativeObjectOrArray)
                ? alternativeObjectOrArray
                : [alternativeObjectOrArray];

            const [newAlternatives, costCache] = parseAlternativesAndHashCosts(alternatives);

            return {
                version: Version.V1,
                name: project["Name"],
                description: project["Comment"],
                analyst: project["analyst"],
                analysisType: convertAnalysisType(project["AnalysisType"]),
                purpose: convertAnalysisPurpose(project["AnalysisPurpose"]),
                dollarMethod: convertDollarMethod(project["DollarMethod"]),
                studyPeriod: parseYears(project["Duration"]),
                discountingMethod: convertDiscountMethod(project["DiscountingMethod"]),
                realDiscountRate: project["DiscountRate"],
                nominalDiscountRate: undefined,
                inflationRate: project["InflationRate"],
                location: parseLocation(project["Location"]),
                alternatives: newAlternatives,
                costs: Array.from(costCache.values()).map(convertCost),
                ghg: {
                    emissionsRateScenario: undefined,
                    socialCostOfGhgScenario: undefined
                }
            } as Project;
        })
    );
}

function parseYears(value: string) {
    const exec = yearRegex.exec(value);

    if (exec !== null) return parseInt(exec.groups?.["years"] ?? "0");

    return 0;
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
        //TODO: handle possible error
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
        case 0:
            return DollarMethod.CONSTANT;
        case 1:
            return DollarMethod.CURRENT;
    }
}

function convertDiscountMethod(old: number) {
    switch (old) {
        case 0: //TODO add message in case of default
        case 1:
            return DiscountingMethod.END_OF_YEAR;
        case 2:
            return DiscountingMethod.MID_YEAR;
    }
}

function parseLocation(old: string): USLocation {
    return {
        country: "US",
        state: old,
        city: undefined,
        zipcode: undefined
    };
}

function extractCosts(alternative: any, name: CostComponent) {
    const componentOrArray = alternative[`${name}s`]?.[name] ?? [];
    const arrayOfComponents = Array.isArray(componentOrArray) ? componentOrArray : [componentOrArray];

    return arrayOfComponents.map((x: object) => {
        return {
            type: name,
            ...x
        };
    });
}

type CostComponent =
    | "CapitalComponent"
    | "EnergyUsage"
    | "WaterUsage"
    | "RecurringContractCost"
    | "NonRecurringContractCost";

function parseAlternativesAndHashCosts(alternatives: any[]): [Alternative[], Map<string, any>] {
    const costCache = new Map<string, any>();

    const newAlternatives = alternatives.map((alternative, i) => {
        const costs = [
            ...extractCosts(alternative, "CapitalComponent"),
            ...extractCosts(alternative, "EnergyUsage"),
            ...extractCosts(alternative, "WaterUsage"),
            ...extractCosts(alternative, "RecurringContractCost"),
            ...extractCosts(alternative, "NonRecurringContractCost")
        ];

        for (const cost of costs) {
            const hash = objectHash(cost);

            if (!costCache.has(hash)) costCache.set(hash, cost);
        }

        const costArray = Array.from(costs.values());

        return {
            id: i,
            name: alternative["Name"],
            description: alternative["Comment"],
            costs: costs.map(costArray.indexOf)
        };
    });

    console.log(costCache);

    return [newAlternatives, costCache];
}

function convertCosts(costCache: Map<string, any>): Cost[] {
    const result: Cost[] = [];

    Array.from(costCache.values()).map((oldCost, i) => {
        return {
            id: i,
            name: oldCost["Name"],
            description: oldCost["Comment"] ?? undefined,
            ...convertCost(oldCost["type"], oldCost)
        } as Cost;
    });

    return result;
}

function convertCost(cost: any) {
    switch (cost.type) {
        case "CapitalComponent":
            return {
                initialCost: cost["InitialCost"],
                expectedLife: parseYears(cost["Duration"])
            };
        case "EnergyUsage":
            return {
                fuelType: parseFuelType(cost["FuelType"]),
                costPerUnit: cost["UnitCost"],
                annualConsumption: cost["YearlyUsage"],
                unit: parseUnit(cost["Unit"]),
                demandCharge: cost["DemandCharge"]
                //TODO escalation, useIndex
            };
        case "WaterUsage":
            return {
                unit: parseUnit(cost["Unit"]),
                usage: parseSeasonalUsage(cost),
                disposal: parseSeasonalDisposal(cost)
                //TODO escalation, useIndex
            };
        case "RecurringContractCost":
            return {
                initialCost: cost["Amount"],
                initialOccurrence: cost[""]
            };
        case "NonRecurringContractCost":
            return {};
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

function parseSeasonalUsage(cost: any): SeasonUsage[] {
    return [
        {
            season: Season.WINTER,
            amount: cost["WinterYearlyUsage"],
            costPerUnit: cost["WinterUsageUnitCost"]
        },
        {
            season: Season.SUMMER,
            amount: cost["SummerYearlyUsage"],
            costPerUnit: cost["SummerUsageUnitCost"]
        }
    ];
}

function parseSeasonalDisposal(cost: any): SeasonUsage[] {
    return [
        {
            season: Season.WINTER,
            amount: cost["WinterYearlyDisposal"],
            costPerUnit: cost["WinterDisposalUnitCost"]
        },
        {
            season: Season.SUMMER,
            amount: cost["SummerYearlyDisposal"],
            costPerUnit: cost["SummerDisposalUnitCost"]
        }
    ];
}
