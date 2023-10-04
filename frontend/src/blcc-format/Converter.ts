import {XMLParser} from "fast-xml-parser";
import {map, pipe} from "rxjs";
import {AnalysisType, DiscountingMethod, DollarMethod, Project, Purpose, USLocation} from "./Format";
import {Version} from "./Verison";
import objectHash from "object-hash";

const yearRegex = /(?<years>\d+) years (?<months>\d+) months/;
const parser = new XMLParser();

export function convert() {
    return pipe(
        map(xml => parser.parse(xml)),
        map(obj => {
            console.log(obj);

            const project = obj["Project"];

            const costCache = hashCosts(project["Alternatives"]["Alternative"]);

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
                alternatives: [],
                ghg: {
                    emissionsRateScenario: undefined,
                    socialCostOfGhgScenario: undefined
                }
            } as Project;
        })
    )
}

function parseYears(value: string) {
    const exec = yearRegex.exec(value);

    if (exec !== null)
        // @ts-ignore
        return exec.groups["years"];

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
        zipcode: undefined,
    }
}

function hashCosts(alternatives: any[]): Map<String, any> {
    const cache = new Map<string, any>();

    for(const alternative of alternatives) {
        const capitalComponents = alternative["CapitalComponents"] ?? [];
        const energyUsages = alternative["EnergyUsages"] ?? [];
        const waterUsages = alternative["WaterUsages"] ?? [];
        const recurringContractCosts = alternative["RecurringContractCosts"] ?? [];
        const nonRecurringContractCosts = alternative["NonRecurringContractCosts"] ?? [];

        const costs = [
            ...(Array.isArray(capitalComponents) ? capitalComponents : [capitalComponents]),
            ...(Array.isArray(energyUsages) ? energyUsages : [energyUsages]),
            ...(Array.isArray(waterUsages) ? waterUsages : [waterUsages]),
            ...(Array.isArray(recurringContractCosts) ? recurringContractCosts : [recurringContractCosts]),
            ...(Array.isArray(nonRecurringContractCosts) ? nonRecurringContractCosts : [nonRecurringContractCosts])
        ];

        console.log(costs);

        for(const cost of costs) {
            const hash = objectHash(cost);

            if(!cache.has(hash))
                cache.set(hash, cost);
        }
    }

    return cache;
}