import { Version } from "./Verison";

export type Project = {
    version: Version;
    name: string;
    description: string;
    analyst: string;
    analysisType: AnalysisType;
    purpose?: Purpose; // For use with OMB_NON_ENERGY
    dollarMethod: DollarMethod;
    studyPeriod: number;
    discountingMethod: DiscountingMethod;
    realDiscountRate?: number;
    nominalDiscountRate?: number;
    inflationRate?: number;
    location: Location;
    alternatives: Alternative[];
    costs: Cost[];
    ghg: GHG;
};

export type GHG = {
    emissionsRateScenario?: EmissionsRateScenario;
    socialCostOfGhgScenario?: SocialCostOfGhgScenario;
};

export enum EmissionsRateScenario {
    BASELINE = "2023 – EIA - Baseline Scenario",
    LOW_RENEWABLE = "2023 – EIA – Low Renewable Cost Scenario"
}

export enum SocialCostOfGhgScenario {
    SCC = "SCC = $0 / ton",
    LOW = "2023 – 5% Discount Rate – Average (“Low”)",
    MEDIUM = "2023 – 3% Discount Rate – Average (“Medium”)",
    HIGHT = "2023 – 3% Discount Rate – 95th Percentile (“High”)"
}

export type Location = USLocation | NonUSLocation;

export type USLocation = {
    country: "US";
    state?: string;
    city?: string;
    zipcode?: string;
};

export type NonUSLocation = {
    country?: string;
    stateProvince?: string;
    city?: string;
};

export enum DiscountingMethod {
    END_OF_YEAR,
    MID_YEAR
}

export enum DollarMethod {
    CONSTANT = "Constant",
    CURRENT = "Current"
}

export enum AnalysisType {
    FEDERAL_FINANCED = "Federal Analysis, Financed Project",
    FEMP_ENERGY = "FEMP Analysis, Energy Project",
    OMB_NON_ENERGY = "OMB Analysis, Non-Energy Project",
    MILCON_ENERGY = "MILCON Analysis, Energy Project",
    MILCON_NON_ENERGY = "MILCON Analysis, Non-Energy Project",
    MILCON_ECIP = "MILCON Analysis, ECIP Project"
}

export enum Purpose {
    INVEST_REGULATION = "Cost-effectiveness, lease-purchase, internal government investment, and asset sales",
    COST_LEASE = "Public investment and regulatory analyses"
}

export type ID = number;

export type Alternative = {
    id: ID;
    name: string;
    description?: string;
    baseline?: boolean;
    costs: ID[];
};

export enum CostTypes {
    CAPITAL,
    ENERGY,
    WATER,
    REPLACEMENT_CAPITAL,
    OMR,
    IMPLEMENTATION_CONTRACT,
    RECURRING_CONTRACT,
    OTHER,
    OTHER_NON_MONETARY
}

export type Cost = (
    | CapitalCost
    | EnergyCost
    | WaterCost
    | ReplacementCapitalCost
    | OMRCost
    | ImplementationContractCost
    | RecurringContractCost
    | OtherCost
    | OtherNonMonetary
) & {
    id: ID;
    name: string;
    description?: string;
    location?: Location;
};

export type CapitalCost = Type<CostTypes.CAPITAL> & {
    initialCost: number;
    annualRateOfChange: number;
    expectedLife: number;
    costAdjustment: number;
    phaseIn: number;
    residualValue: ResidualValue;
};

export type ResidualValue = {
    approach: DollarOrPercent;
    value: number;
};

export enum DollarOrPercent {
    PERCENT = "Percent",
    DOLLAR = "Dollar"
}

export enum FuelType {
    ELECTRICITY = "Electricity",
    DISTILLATE_OIL = "Distillate Fuel Oil (#1, #2)",
    RESIDUAL_OIL = "Residual Fuel Oil (#4, #5, #6)",
    NATURAL_GAS = "Natural Gas",
    PROPANE = "Liquefied Petroleum Gas / Propane",
    OTHER = "Other (Coal, Steam, etc.)"
}

export type EnergyCost = Type<CostTypes.ENERGY> & {
    fuelType: FuelType;
    customerSector?: CustomerSector;
    location?: Location;
    costPerUnit: number;
    annualConsumption: number;
    unit: Unit;
    demandCharge?: number;
    rebate?: number;
    escalation: number | number[];
    useIndex: number | number[];
};

export enum CustomerSector {
    COMMERCIAL = "Commercial",
    INDUSTRIAL = "Industrial"
}

export type Unit = ElectricityUnit | NaturalGasUnit | FuelOilUnit | LiquefiedPetroleumGasUnit | CoalUnit;

export enum EnergyUnit {
    KWH = "kWh",
    THERM = "Therm",
    MBTU = "MBtu",
    MJ = "Mj",
    GJ = "Gj"
}

export enum CubicUnit {
    CUBIC_METERS = "Cubic meters",
    CUBIC_FEET = "Cubic feet"
}

export enum LiquidUnit {
    LITER = "Liter",
    K_LITER = "1000 liters",
    GALLON = "Gallon",
    K_GALLON = "1000 gallons"
}

export enum WeightUnit {
    KG = "kg",
    POUND = "Pound",
    TON = "Ton"
}

export type ElectricityUnit = EnergyUnit;
export type NaturalGasUnit = EnergyUnit | CubicUnit;
export type FuelOilUnit = EnergyUnit | LiquidUnit;
export type LiquefiedPetroleumGasUnit = EnergyUnit | CubicUnit | LiquidUnit;
export type CoalUnit = EnergyUnit | WeightUnit;

export type WaterCost = Type<CostTypes.WATER> & {
    unit: WaterUnit;
    usage: SeasonUsage[]; //Default to summer and winter, can only have one of each season
    disposal: SeasonUsage[];
    escalation: number | number[];
    useIndex: number | number[];
};

export type SeasonUsage = {
    season: Season;
    amount: number;
    costPerUnit: number;
};

export enum Season {
    SPRING = "Spring",
    SUMMER = "Summer",
    AUTUMN = "Autumn",
    WINTER = "Winter"
}

export type WaterUnit = LiquidUnit | CubicUnit;

export type ReplacementCapitalCost = Type<CostTypes.REPLACEMENT_CAPITAL> & {
    initialCost: number;
    annualRateOfChange: number;
    expectedLife: number;
    residualValue: ResidualValue;
};

export type OMRCost = Type<CostTypes.OMR> & {
    initialCost: number;
    initialOccurrence: number;
    annualRateOfChange: number;
    rateOfRecurrence?: number;
};

export type ImplementationContractCost = Type<CostTypes.IMPLEMENTATION_CONTRACT> & {
    occurrence: number;
    cost: number;
};

export type RecurringContractCost = Type<CostTypes.RECURRING_CONTRACT> & {
    initialCost: number;
    initialOccurrence: number;
    annualRateOfChange: number;
    rateOfRecurrence?: number;
};

export type OtherCost = Type<CostTypes.OTHER> & {
    costOrBenefit: CostBenefit;
    tag: string;
    initialOccurrence: number;
    valuePerUnit: number;
    numberOfUnits: number;
    unit: string | Unit;
    recurring: boolean;
    rateOfChangeValue: number | number[];
    rateOfChangeUnits: number | number[];
};

export enum CostBenefit {
    COST = "Cost",
    Benefit = "Benefit"
}

export type OtherNonMonetary = Type<CostTypes.OTHER_NON_MONETARY> & {
    tag: string;
    initialOccurrence: number;
    numberOfUnits: number;
    unit: string | Unit;
    recurring: boolean;
    rateOfRecurrence: number;
    rateOfChangeValue: number | number[];
    rateOfChangeUnit: number | number[];
};

export type Type<T> = {
    type: T;
};
