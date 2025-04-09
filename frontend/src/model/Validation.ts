import { createSignal } from "@react-rxjs/utils";
import {
    allCosts$,
    alternatives$,
    energyCostsByAlternative$,
    hasBaseline$,
    implementationContractCostsByAlternative$,
    investmentCostsByAlternative$,
    Model,
    omrCostsByAlternative$,
    recurringContractCostsByAlternative$,
    replacementCostsByAlternative$,
} from "./Model";
import { combineLatest, map, mergeMap, of, switchMap, tap, type Observable } from "rxjs";
import type { ZodError } from "zod";
import { AnalysisType, CostTypes, DollarMethod } from "blcc-format/Format";
import { analysisType } from "constants/DROPDOWN";
import { bind } from "@react-rxjs/core";

export type ErrorGroup = {
    url: string;
    messages: string[];
    context?: string;
};

const GENERAL_INFORMATION_PAGE = "/editor/";

const ALTERNATIVE_SUMMARY_PAGE = "/editor/alternative/";

const getFieldValidationError: (fieldname: string, zodError: ZodError | undefined) => string[] = (
    fieldName: string,
    zodError: ZodError | undefined,
) => (zodError === undefined ? [] : [`${fieldName} - ${zodError.issues[0].message}`]);

function getErrorGroups(url: string, messages: string[][], context: string): ErrorGroup[] {
    const flatErrorMessages = messages.flat();
    return flatErrorMessages.length === 0 ? [] : [{ url, messages: messages.flat(), context }];
}

function getContext(altName: string | undefined, costName: string): string {
    return `${altName ? altName : "Unnamed Alternative"} - ${costName ? costName : "Unnamed Cost"}`;
}

/* ------------ VALIDATION STREAMS ------------ */

/* GENERAL INFORMATION */

const projectNameValidation$: Observable<string[]> = Model.name.validation$.pipe(
    map((zodError) => getFieldValidationError("Name", zodError)),
);

const analysisTypeValidation$: Observable<string[]> = Model.analysisType.$.pipe(
    map((analysisType) => (analysisType === undefined ? ["Analysis Type - Required"] : [])),
);

const analysisPurposeValidation$: Observable<string[]> = Model.analysisType.$.pipe(
    switchMap((analysisType) =>
        analysisType === AnalysisType.OMB_NON_ENERGY
            ? Model.purpose.validation$.pipe(map((zodError) => getFieldValidationError("Analysis Purpose", zodError)))
            : of([]),
    ),
);

const hasStudyPeriodValidation$: Observable<string[]> = Model.studyPeriod.validation$.pipe(
    map((zodError) => getFieldValidationError("Study Period", zodError)),
);

const constructionPeriodValidation$: Observable<string[]> = Model.constructionPeriod.validation$.pipe(
    map((zodError) => getFieldValidationError("Construction Period", zodError)),
);

const hasDiscountingMethod$: Observable<string[]> = Model.discountingMethod.$.pipe(
    map((discountingMethod) => (discountingMethod === undefined ? ["Discounting Convention - Required"] : [])),
);

const zipCodeValidation$: Observable<string[]> = Model.Location.zipcode.validation$.pipe(
    map((zodError) => getFieldValidationError("Zipcode", zodError)),
);

/* General Information - Rates Validation */

const realDiscountRateValidation$: Observable<string[]> = Model.realDiscountRate.validation$.pipe(
    map((zodError) => getFieldValidationError("Real Discount Rate", zodError)),
);

const nominalDiscountRateValidation$: Observable<string[]> = Model.nominalDiscountRate.validation$.pipe(
    map((zodError) => getFieldValidationError("Nominal Discount Rate", zodError)),
);

const inflationRateValidation$: Observable<string[]> = Model.inflationRate.validation$.pipe(
    map((zodError) => getFieldValidationError("Inflation Rate", zodError)),
);

const currentMethodValidation$: Observable<string[]> = nominalDiscountRateValidation$.pipe(
    mergeMap((nominalDiscountRateError) =>
        inflationRateValidation$.pipe(map((inflationRateError) => nominalDiscountRateError.concat(inflationRateError))),
    ),
);

const ratesValidation$: Observable<string[]> = Model.dollarMethod.$.pipe(
    switchMap((dollarMethod) =>
        dollarMethod === DollarMethod.CONSTANT ? realDiscountRateValidation$ : currentMethodValidation$,
    ),
);

const generalInformationErrors$: Observable<ErrorGroup[]> = combineLatest([
    projectNameValidation$,
    analysisTypeValidation$,
    analysisPurposeValidation$,
    hasStudyPeriodValidation$,
    constructionPeriodValidation$,
    hasDiscountingMethod$,
    zipCodeValidation$,
    ratesValidation$,
]).pipe(
    map((errorMessages) => {
        return getErrorGroups(GENERAL_INFORMATION_PAGE, errorMessages, "General Information");
    }),
);

/* PROJECT-WIDE */

const moreThanTwoAlternatives$: Observable<string[]> = alternatives$.pipe(
    map((arr) => (arr.length < 2 ? ["Need more than one alternative"] : [])),
);

const hasBaselineValidation$: Observable<string[]> = hasBaseline$.pipe(
    map((hasBaseline) => (hasBaseline ? ["Must have a baseline alternative"] : [])),
);

const projectErrors$: Observable<ErrorGroup[]> = combineLatest([moreThanTwoAlternatives$, hasBaselineValidation$]).pipe(
    map((errorMessages) => {
        return getErrorGroups(ALTERNATIVE_SUMMARY_PAGE, errorMessages, "Project");
    }),
);

const alternativeCostValidation$: Observable<ErrorGroup[]> = alternatives$.pipe(
    map((alternatives) =>
        alternatives.reduce((errors, alternative) => {
            if (alternative.costs.length < 1)
                errors.push({
                    url: `${ALTERNATIVE_SUMMARY_PAGE}${alternative.id}`,
                    messages: ["Need at least one cost per alternative"],
                    context: alternative.name,
                });
            return errors;
        }, [] as ErrorGroup[]),
    ),
);

/* PER COST */

const energyCostValidation$: Observable<ErrorGroup[]> = energyCostsByAlternative$.pipe(
    map((costs) =>
        costs.reduce((errors, cost) => {
            const messages = [];
            if (cost.name === undefined || cost.name === "") {
                messages.push("Name - Required");
            }
            if (cost.customerSector === undefined) {
                messages.push("Customer Sector - Required");
            }
            if (messages.length > 0) {
                errors.push({
                    url: `/editor/alternative/${cost.altId}/cost/${cost.id}`,
                    messages,
                    context: getContext(cost.altName, cost.name),
                });
            }
            return errors;
        }, [] as ErrorGroup[]),
    ),
);

const investmentCostValidation$: Observable<ErrorGroup[]> = investmentCostsByAlternative$.pipe(
    map((costs) =>
        costs.reduce((errors, cost) => {
            const messages = [];
            if (cost.name === undefined || cost.name === "") {
                messages.push("Name - Required");
            }
            if (cost.initialCost === undefined) {
                messages.push("Initial Cost - Required");
            }
            if (cost.expectedLife === undefined) {
                messages.push("Expected Lifetime - Required");
            }
            if (messages.length > 0) {
                errors.push({
                    url: `/editor/alternative/${cost.altId}/cost/${cost.id}`,
                    messages,
                    context: getContext(cost.altName, cost.name),
                });
            }
            return errors;
        }, [] as ErrorGroup[]),
    ),
);

const replacementCostValidation$: Observable<ErrorGroup[]> = replacementCostsByAlternative$.pipe(
    map((costs) =>
        costs.reduce((errors, cost) => {
            const messages = [];
            if (cost.name === undefined || cost.name === "") {
                messages.push("Name - Required");
            }
            if (cost.initialCost === undefined) {
                messages.push("Initial Cost - Required");
            }
            if (cost.expectedLife === undefined) {
                messages.push("Expected Lifetime - Required");
            }
            if (messages.length > 0) {
                errors.push({
                    url: `/editor/alternative/${cost.altId}/cost/${cost.id}`,
                    messages,
                    context: getContext(cost.altName, cost.name),
                });
            }
            return errors;
        }, [] as ErrorGroup[]),
    ),
);

const omrCostValidation$: Observable<ErrorGroup[]> = omrCostsByAlternative$.pipe(
    map((costs) =>
        costs.reduce((errors, cost) => {
            const messages = [];
            if (cost.name === undefined || cost.name === "") {
                messages.push("Name - Required");
            }
            if (cost.initialCost === undefined) {
                messages.push("Initial Cost - Required");
            }
            if (messages.length > 0) {
                errors.push({
                    url: `/editor/alternative/${cost.altId}/cost/${cost.id}`,
                    messages,
                    context: getContext(cost.altName, cost.name),
                });
            }
            return errors;
        }, [] as ErrorGroup[]),
    ),
);

const implementationContractValidation$: Observable<ErrorGroup[]> = implementationContractCostsByAlternative$.pipe(
    map((costs) =>
        costs.reduce((errors, cost) => {
            const messages = [];
            if (cost.name === undefined || cost.name === "") {
                messages.push("Name - Required");
            }
            if (cost.cost === undefined) {
                messages.push("Initial Cost - Required");
            }
            if (messages.length > 0) {
                errors.push({
                    url: `/editor/alternative/${cost.altId}/cost/${cost.id}`,
                    messages,
                    context: getContext(cost.altName, cost.name),
                });
            }
            return errors;
        }, [] as ErrorGroup[]),
    ),
);

const recurringContractValidation$: Observable<ErrorGroup[]> = recurringContractCostsByAlternative$.pipe(
    map((costs) =>
        costs.reduce((errors, cost) => {
            const messages = [];
            if (cost.name === undefined || cost.name === "") {
                messages.push("Name - Required");
            }
            if (cost.initialCost === undefined) {
                messages.push("Initial Cost - Required");
            }
            if (messages.length > 0) {
                errors.push({
                    url: `/editor/alternative/${cost.altId}/cost/${cost.id}`,
                    messages,
                    context: getContext(cost.altName, cost.name),
                });
            }
            return errors;
        }, [] as ErrorGroup[]),
    ),
);

/* ------------ ERROR STREAM ------------ */

export const errors$ = combineLatest([
    generalInformationErrors$,
    projectErrors$,
    alternativeCostValidation$,
    energyCostValidation$,
    investmentCostValidation$,
    replacementCostValidation$,
    omrCostValidation$,
    implementationContractValidation$,
    recurringContractValidation$,
]).pipe(map((errors) => errors.flat()));

export const [useErrors] = bind(errors$, []);

// The first error in the database to display to the user, or undefined if there are no errors
export const [useFirstError, firstError$] = bind(errors$.pipe(map((arr) => (arr ? arr[0] : undefined))), undefined);

// True if the project is valid, otherwise false
export const isValid$ = firstError$.pipe(map((error) => error === undefined));
export const [isValid] = bind(isValid$, true);
