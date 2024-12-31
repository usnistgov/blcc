import {
    type Cost,
    CostTypes,
    type EnergyCost,
    type Location,
    type NonUSLocation,
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
