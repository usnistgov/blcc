import type { Measures, Optional } from "@lrd/e3-sdk";
import { type DefaultedStateObservable, state } from "@react-rxjs/core";
import { type Alternative, type Cost, CostTypes, type ID } from "blcc-format/Format";
import Decimal from "decimal.js";
import { identity } from "effect";
import { type Observable, Subject, distinctUntilChanged, merge } from "rxjs";
import type { AjaxResponse } from "rxjs/internal/ajax/AjaxResponse";
import { ajax } from "rxjs/internal/ajax/ajax";
import { map } from "rxjs/operators";

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

export function getOptionalTag<T = number>(
    measures: Measures[],
    tag: string,
    map: ((value: number) => T) | undefined = undefined,
): { [key: string]: T } {
    return measures.reduce((acc, next, i) => {
        const value = next.totalTagFlows[tag];
        // @ts-ignore
        acc[i.toString()] = map === undefined ? value : map(next.totalTagFlows[tag]);
        return acc;
    }, {});
}

export function stateStream<
    B,
    C extends keyof B,
    D extends B[C] | undefined,
    Result extends D extends undefined ? Observable<B[C]> : DefaultedStateObservable<B[C]>,
>(input$: Observable<B>, property: C, initial: D = undefined as D): [Subject<B[C]>, Result] {
    const sSubject$ = new Subject<B[C]>();

    const stream$ = merge(sSubject$, input$.pipe(map((obj) => obj[property])).pipe(distinctUntilChanged()));

    return [sSubject$, (initial !== undefined ? state(stream$, initial) : stream$) as Result];
}

const COPY_REGEX = /^(.*)( Copy)(?:\((\d+)\))?$/;

/**
 * Returns the new name for variable that is cloned. The first one has "... Copy" appended onto it, with each
 * successive copy being given a number: "... Copy(1)", "... Copy(2)", etc.
 * @param name The name to copy.
 */
export function cloneName(name: string): string {
    if (COPY_REGEX.test(name))
        return name.replace(
            COPY_REGEX,
            (_, name, copyString, num) => `${name}${copyString}(${Number.parseInt(num ?? "0") + 1})`,
        );

    return `${name} Copy`;
}

/**
 * Calculates the nominal discount rate from the given real and inflation rates.
 *
 * @param real The real discount rate.
 * @param inflation The inflation rate.
 */
export function calculateNominalDiscountRate(real: number, inflation: number): number {
    return (1 + real) * (1 + inflation) - 1;
}

/**
 * Calculates the real discount rate from the given nominal and inflation rates.
 *
 * @param nominal The nominal discount rate.
 * @param inflation The inflation rate.
 */
export function calculateRealDiscountRate(nominal: number, inflation: number): number {
    return (1 + nominal) / (1 + inflation) - 1;
}

export function closest<T>(array: T[], extractor: (t: T) => number, value: number): T {
    return array.reduce((current, next) => {
        const nextValue = extractor(next);
        const currentValue = extractor(current);

        return Math.abs(nextValue - value) < Math.abs(currentValue - value) ? next : current;
    });
}

/**
 * Converts a decimal value to a percentage.
 *
 * @param decimal - The decimal value to be converted to a percentage.
 * @returns A percentage value.
 */
export function toPercentage(decimal: number | string) {
    return new Decimal(decimal).mul(100).toNumber();
}

/**
 * Converts a percentage to a decimal value.
 *
 * @param percentage - The percentage to be converted to a decimal.
 * @returns A decimal value.
 */
export function toDecimal(percentage: number | string) {
    return new Decimal(percentage).div(100).toNumber();
}

export const ajaxDefault = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
};

/**
 * Creates an array of a specified length, filled with a specified value.
 *
 * @param n - The number of elements in the array.
 * @param fill - The value to fill the array with.
 * @returns An array of length `n`, where each element is `fill`.
 */
export function makeArray<T>(n: number, fill: T): T[] {
    return Array.from({ length: n }, () => fill);
}

export function getResponse<T>(ajaxResponse: AjaxResponse<T>) {
    return ajaxResponse.response;
}

export function index<T>(i: number) {
    return (x: T[]) => x[i];
}

export function makeApiRequest<T>(url: string, body: object): Observable<T> {
    return ajax<T>({
        ...ajaxDefault,
        url: `/api/${url}`,
        body,
    }).pipe(map(getResponse));
}

/**
 * Finds the ID of the baseline alternative if one exists, otherwise returns undefined.
 * @param alternatives The list of alternatives to find the baseline ID from.
 */
export function findBaselineID(alternatives: Alternative[]): ID | undefined {
    return alternatives.find((alternative) => alternative.baseline)?.id;
}

/**
 * Creates a map of alternative ID's to the name of the corresponding alternative.
 * @param alternatives The list of alternative to create the name map for.
 */
export function createAlternativeNameMap(alternatives: Alternative[]): Map<ID, string> {
    return new Map(alternatives.map((x) => [x.id ?? 0, x.name]));
}

/**
 * Returns a map of tags to optionals
 * @param optionals
 */
export function groupOptionalByTag(optionals: Optional[]): Map<string, Optional> {
    return new Map<string, Optional>(optionals.map((optional) => [`${optional.altId} ${optional.tag}`, optional]));
}
