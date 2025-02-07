import type { Version } from "blcc-format/Verison";
import type { EscalationRates } from "blcc-format/schema";
import type { Country, State } from "constants/LOCATION";

export type Project = {
    id?: number;
    version: Version;
    name?: string;
    description?: string;
    analyst?: string;
    analysisType?: AnalysisType;
    purpose?: Purpose; // For use with OMB_NON_ENERGY
    dollarMethod: DollarMethod;
    case: Case;
    studyPeriod?: number;
    constructionPeriod: number;
    discountingMethod?: DiscountingMethod;
    realDiscountRate?: number;
    nominalDiscountRate?: number;
    inflationRate?: number;
    location: Location;
    projectEscalationRates?: typeof EscalationRates.Type;
    alternatives: ID[];
    costs: ID[];
    ghg: GHG;
    releaseYear: number;
};

export type GHG = {
    dataSource: GhgDataSource;
    emissionsRateType: EmissionsRateType;
};

export type Location = USLocation | NonUSLocation;

export type USLocation = {
    country: Country.USA;
    state?: State;
    city?: string;
    zipcode?: string;
};

export type NonUSLocation = {
    country?: Country;
    stateProvince?: string;
    city?: string;
};

export enum DiscountingMethod {
    END_OF_YEAR = "End of Year",
    MID_YEAR = "Mid Year",
}

export enum DollarMethod {
    CONSTANT = "Constant",
    CURRENT = "Current",
}

export enum AnalysisType {
    FEDERAL_FINANCED = "Federal Analysis, Financed Project",
    FEMP_ENERGY = "FEMP Analysis, Energy Project",
    OMB_NON_ENERGY = "OMB Analysis, Non-Energy Project",
    MILCON_ENERGY = "MILCON Analysis, Energy Project",
    MILCON_NON_ENERGY = "MILCON Analysis, Non-Energy Project",
    MILCON_ECIP = "MILCON Analysis, ERCIP (formerly ECIP) Project",
}

export enum Purpose {
    INVEST_REGULATION = "Cost-effectiveness, lease-purchase, internal government investment, and asset sales",
    COST_LEASE = "Public investment and regulatory analyses",
}

export type ID = number;

export type Alternative = {
    id?: ID;
    name: string;
    description?: string;
    baseline?: boolean;
    costs: ID[];
};

export enum CostTypes {
    CAPITAL = "Capital",
    ENERGY = "Energy",
    WATER = "Water",
    REPLACEMENT_CAPITAL = "Replacement Capital",
    OMR = "OMR",
    IMPLEMENTATION_CONTRACT = "Contract Implementation",
    RECURRING_CONTRACT = "Recurring Contract",
    OTHER = "Other Monetary",
    OTHER_NON_MONETARY = "Other Non-Monetary",
}

export type UseIndex = {
    useIndex?: number | number[];
};

export type EscalationRate = {
    customEscalation?: boolean;
    escalation?: number | number[];
};

export type Cost =
    | CapitalCost
    | EnergyCost
    | WaterCost
    | ReplacementCapitalCost
    | OMRCost
    | ImplementationContractCost
    | RecurringContractCost
    | OtherCost
    | OtherNonMonetary;

export type BaseCost = {
    id?: ID;
    name: string;
    description?: string;
    location?: Location;
    costSavings?: boolean;
};

export type ResidualValueCost = {
    residualValue?: ResidualValue;
};

export type CapitalCost = Type<CostTypes.CAPITAL> &
    BaseCost &
    ResidualValueCost & {
        initialCost?: number;
        amountFinanced?: number;
        annualRateOfChange?: number;
        expectedLife: number;
        costAdjustment?: number;
        phaseIn?: number[]; // Percent of initial cost paid per year. Must add up to 100%.
    };

export type ResidualValue = {
    approach: DollarOrPercent;
    value: number;
};

export enum DollarOrPercent {
    PERCENT = "%",
    DOLLAR = "$",
}

export enum FuelType {
    ELECTRICITY = "Electricity",
    DISTILLATE_OIL = "Distillate Fuel Oil (#1, #2)",
    RESIDUAL_OIL = "Residual Fuel Oil (#4, #5, #6)",
    NATURAL_GAS = "Natural Gas",
    PROPANE = "Liquefied Petroleum Gas / Propane",
    COAL = "Coal",
    OTHER = "Other (Steam, etc.)",
}

export type EnergyCost = Type<CostTypes.ENERGY> &
    BaseCost &
    UseIndex &
    EscalationRate & {
        fuelType: FuelType;
        customerSector?: CustomerSector;
        location?: Location;
        costPerUnit: number;
        annualConsumption: number;
        unit: Unit;
        demandCharge?: number;
        rebate?: number;
        emissions?: number[];
    };

export enum CustomerSector {
    RESIDENTIAL = "Residential",
    COMMERCIAL = "Commercial",
    INDUSTRIAL = "Industrial",
}

export type Unit = ElectricityUnit | NaturalGasUnit | FuelOilUnit | LiquefiedPetroleumGasUnit | CoalUnit;

export enum EnergyUnit {
    KWH = "kWh",
    THERM = "Therm",
    MBTU = "MBtu",
    MJ = "Mj",
    GJ = "Gj",
}

export enum CubicUnit {
    CUBIC_METERS = "Cubic meters",
    CUBIC_FEET = "Cubic feet",
}

export enum LiquidUnit {
    LITER = "Liter",
    K_LITER = "1000 liters",
    GALLON = "Gallon",
    K_GALLON = "1000 gallons",
}

export enum WeightUnit {
    KG = "kg",
    POUND = "Pound",
    TON = "Ton",
}

export type ElectricityUnit = EnergyUnit;
export type NaturalGasUnit = EnergyUnit | CubicUnit;
export type FuelOilUnit = EnergyUnit | LiquidUnit;
export type LiquefiedPetroleumGasUnit = EnergyUnit | CubicUnit | LiquidUnit;
export type CoalUnit = EnergyUnit | WeightUnit;

export type WaterCost = Type<CostTypes.WATER> &
    BaseCost &
    UseIndex &
    EscalationRate & {
        unit: WaterUnit;
        usage: SeasonUsage[]; //Default to summer and winter, can only have one of each season
        disposal: SeasonUsage[];
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
    WINTER = "Winter",
}

export type WaterUnit = LiquidUnit | CubicUnit;

export type ReplacementCapitalCost = Type<CostTypes.REPLACEMENT_CAPITAL> &
    BaseCost &
    ResidualValueCost & {
        initialOccurrence: number;
        initialCost: number;
        annualRateOfChange?: number;
        expectedLife?: number;
    };

export type OMRCost = Type<CostTypes.OMR> &
    BaseCost & {
        initialCost: number;
        initialOccurrence: number;
        recurring?: Recurring;
    };

export type ImplementationContractCost = Type<CostTypes.IMPLEMENTATION_CONTRACT> &
    BaseCost & {
        occurrence: number;
        cost: number;
    };

export type Recurring = {
    rateOfRecurrence?: number;
    rateOfChangeValue?: number | number[];
    rateOfChangeUnits?: number | number[];
};

export type RecurringContractCost = Type<CostTypes.RECURRING_CONTRACT> &
    BaseCost & {
        initialCost: number;
        initialOccurrence: number;
        annualRateOfChange: number;
        recurring?: Recurring;
    };

export type OtherCost = Type<CostTypes.OTHER> &
    BaseCost & {
        costOrBenefit: CostBenefit;
        tags?: string[];
        initialOccurrence: number;
        valuePerUnit: number;
        numberOfUnits: number;
        unit?: string | Unit;
        recurring?: Recurring;
    };

export enum CostBenefit {
    COST = "Cost",
    BENEFIT = "Benefit",
}

export type OtherNonMonetary = Type<CostTypes.OTHER_NON_MONETARY> &
    BaseCost & {
        tags?: string[];
        initialOccurrence: number;
        numberOfUnits: number;
        unit?: string | Unit;
        recurring?: Recurring;
    };

export type Type<T> = {
    type: T;
};

export enum Case {
    REF = "REF",
    LOWZTC = "lowZTC",
}

export enum GhgDataSource {
    NIST_NETL = "NIST NETL",
    NREL_CAMBIUM = "NREL Cambium",
}

export enum EmissionsRateType {
    AVERAGE = "Average",
    LONG_RUN_MARGINAL = "Long-Run Marginal (lrm)",
}
