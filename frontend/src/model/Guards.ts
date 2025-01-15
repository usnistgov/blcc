import {
    type Cost,
    CostTypes,
    type EnergyCost,
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
