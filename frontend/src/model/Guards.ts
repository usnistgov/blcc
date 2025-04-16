import {
    type CapitalCost,
    type Cost,
    CostTypes,
    type EnergyCost,
    type ImplementationContractCost,
    type Location,
    type NonUSLocation,
    type OMRCost,
    type OtherCost,
    type OtherNonMonetary,
    type RecurringContractCost,
    type ReplacementCapitalCost,
    type USLocation,
} from "blcc-format/Format";
import { Country } from "constants/LOCATION";

/**
 * Checks if a location is a US location.
 *
 * @param location - The location to check.
 * @returns True if the location is a US location, false otherwise.
 */
export function isUSLocation(location: Location): location is USLocation {
    return location.country === Country.USA;
}

/**
 * Checks if a location is a non-US location.
 *
 * @param location - The location to check.
 * @returns True if the location is a non-US location, false otherwise.
 */
export function isNonUSLocation(location: Location): location is NonUSLocation {
    return location.country !== Country.USA;
}

/**
 * Returns true if the given cost is an energy cost.
 *
 * @param cost - The cost to check.
 * @returns True if the cost is an energy cost otherwise false.
 */
export function isEnergyCost(cost: Cost): cost is EnergyCost {
    return cost.type === CostTypes.ENERGY;
}

export type RecurringTypes = RecurringContractCost | OtherCost | OtherNonMonetary | OMRCost;

/**
 * Checks if the given cost is a recurring cost.
 *
 * The given cost is considered recurring if its type is one of the following:
 * - OMR
 * - Recurring Contract
 * - Other
 * - Other Non-Monetary
 *
 * @param cost - The cost to check.
 * @returns true if the cost is a recurring cost.
 */
export function isRecurringCost(cost: Cost): cost is RecurringTypes {
    return (
        cost.type === CostTypes.OMR ||
        cost.type === CostTypes.RECURRING_CONTRACT ||
        cost.type === CostTypes.OTHER ||
        cost.type === CostTypes.OTHER_NON_MONETARY
    );
}

export type RateOfChangeValueTypes = ImplementationContractCost | RecurringContractCost | OtherCost | OMRCost;

export function isRateOfChangeValueCost(cost: Cost): cost is RateOfChangeValueTypes {
    return (
        cost.type === CostTypes.OMR ||
        cost.type === CostTypes.RECURRING_CONTRACT ||
        cost.type === CostTypes.IMPLEMENTATION_CONTRACT ||
        cost.type === CostTypes.OTHER
    );
}

export type RateOfChangeUnitTypes = OtherCost | OtherNonMonetary;

export function isRateOfChangeUnitCost(cost: Cost): cost is RateOfChangeUnitTypes {
    return cost.type === CostTypes.OTHER || cost.type === CostTypes.OTHER_NON_MONETARY;
}

/**
 * Checks if the given cost is a recurring contract cost.
 *
 * The given cost is considered a recurring contract cost if its type is `RECURRING_CONTRACT`.
 *
 * @param cost - The cost to check.
 * @returns True if the cost is a recurring contract cost, false otherwise.
 */
export function isRecurringContractCost(cost: Cost): cost is RecurringContractCost {
    return cost.type === CostTypes.RECURRING_CONTRACT;
}

/**
 * Checks if the given cost is a replacement capital cost.
 *
 * The given cost is considered a replacement capital cost if its type is `REPLACEMENT_CAPITAL`.
 *
 * @param cost - The cost to check.
 * @returns True if the cost is a replacement capital cost, false otherwise.
 */
export function isReplacementCapitalCost(cost: Cost): cost is ReplacementCapitalCost {
    return cost.type === CostTypes.REPLACEMENT_CAPITAL;
}

export function isImplementationContractCost(cost: Cost): cost is ImplementationContractCost {
    return cost.type === CostTypes.IMPLEMENTATION_CONTRACT;
}

// Returns true if the given cost is a water cost.
export function isWaterCost(cost: Cost) {
    return cost !== undefined && cost.type === CostTypes.WATER;
}

// Returns true if the given cost is a capital cost or one of its subcategories.
export function isCapitalCost(cost: Cost) {
    const type = cost.type;
    return type === CostTypes.CAPITAL || type === CostTypes.REPLACEMENT_CAPITAL || type === CostTypes.OMR;
}

// Returns true if the given cost is a contract cost or one of its subcategories.
export function isContractCost(cost: Cost) {
    const type = cost.type;
    return type === CostTypes.IMPLEMENTATION_CONTRACT || type === CostTypes.RECURRING_CONTRACT;
}

// Returns true if the given cost is an 'other' cost or one of its subcategories.
export function isOtherCost(cost: Cost) {
    const type = cost.type;
    return type === CostTypes.OTHER || type === CostTypes.OTHER_NON_MONETARY;
}

export function isOtherMonetary(cost: Cost) {
    return cost.type === CostTypes.OTHER;
}

export function isOtherNonMonetary(cost: Cost) {
    return cost.type === CostTypes.OTHER_NON_MONETARY;
}

export function isCapital(cost: Cost) {
    return cost.type === CostTypes.CAPITAL;
}

export function isOMRCost(cost: Cost) {
    return cost.type === CostTypes.OMR;
}

/**
 * Checks if the given cost is a cost with residual value
 */
export function isResidualValueCost(cost: Cost): cost is CapitalCost | ReplacementCapitalCost {
    return cost.type === CostTypes.CAPITAL || cost.type === CostTypes.REPLACEMENT_CAPITAL;
}
