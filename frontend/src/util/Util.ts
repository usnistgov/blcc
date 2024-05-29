import type { Measures } from "@lrd/e3-sdk";
import { type Cost, CostTypes } from "../blcc-format/Format";

// Returns true if the given cost is an energy cost.
export function isEnergyCost(cost: Cost) {
    return cost !== undefined && cost.type === CostTypes.ENERGY;
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

export function getNewID(values: { id: number }[]) {
    const ids = values.map((value) => value.id);
    const newID = Math.max(...ids) + 1;

    if (newID < 0) return 0;

    return newID;
}

export const dollarFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export const numberFormatter = Intl.NumberFormat("en-US");

export const percentFormatter = Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
});

export function getOptionalTag(measures: Measures[], tag: string) {
    return measures.reduce((acc, next, i) => {
        // @ts-ignore
        acc[i.toString()] = next.totalTagFlows[tag];
        return acc;
    }, {});
}
