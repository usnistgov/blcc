import { Cost, CostTypes } from "../blcc-format/Format";

// Returns true if the given cost is an energy cost.
export function isEnergyCost(cost: Cost) {
    return cost?.type !== undefined && cost.type === CostTypes.ENERGY;
}

// Returns true if the given cost is a water cost.
export function isWaterCost(cost: Cost) {
    return cost?.type !== undefined && cost.type === CostTypes.WATER;
}

// Returns true if the given cost is a capital cost or one of its subcategories.
export function isCapitalCost(cost: Cost) {
    const type = cost?.type;
    return type === CostTypes.CAPITAL || type === CostTypes.REPLACEMENT_CAPITAL || type === CostTypes.OMR;
}

// Returns true if the given cost is a contract cost or one of its subcategories.
export function isContractCost(cost: Cost) {
    const type = cost?.type;
    return type === CostTypes.IMPLEMENTATION_CONTRACT || type === CostTypes.RECURRING_CONTRACT;
}

// Returns true if the given cost is an 'other' cost or one of its subcategories.
export function isOtherCost(cost: Cost) {
    const type = cost?.type;
    return type === CostTypes.OTHER || type === CostTypes.OTHER_NON_MONETARY;
}

/**
 * Returns a new ID that does not collide with any of the provided IDs.
 *
 * @param ids The IDs that already exist.
 */
export function getNewID(ids: number[]) {
    const newID = Math.max(...ids) + 1;

    if (newID < 0) return 0;

    return newID;
}

/**
 * Default formatter for US currency values.
 */
export const dollarFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});
