import { createSignal } from "@react-rxjs/utils";
import { alternatives$, hasBaseline$, Model } from "./Model";
import { combineLatest, map, mergeMap, of, switchMap, tap, type Observable } from "rxjs";
import type { ZodError } from "zod";
import { AnalysisType, DollarMethod } from "blcc-format/Format";
import { analysisType } from "constants/DROPDOWN";

type Error = {
    url: string;
    messages: string[];
};

// Signal for when an error message is click to navigate to error location
export const [errorClick$, errorClick] = createSignal();

const GENERAL_INFORMATION_PAGE = "/editor/";

const ALTERNATIVE_SUMMARY_PAGE = "/editor/alternative/";

const getFieldValidationError = (fieldName: string, url: string, zodError: ZodError | undefined) =>
    zodError === undefined
        ? []
        : [{ url: GENERAL_INFORMATION_PAGE, messages: [`${fieldName} - ${zodError.issues[0].message}`] }];

/* ------------ VALIDATION STREAMS ------------ */

/* GENERAL INFORMATION */

const analysisTypeValidation$ = Model.analysisType.$.pipe(
    map((analysisType) =>
        analysisType === undefined ? [{ url: GENERAL_INFORMATION_PAGE, messages: ["Analysis Type - Required"] }] : [],
    ),
);

const analysisPurposeValidation$ = Model.analysisType.$.pipe(
    switchMap((analysisType) =>
        analysisType === AnalysisType.OMB_NON_ENERGY
            ? Model.purpose.validation$.pipe(
                  map((zodError) => getFieldValidationError("Analysis Purpose", GENERAL_INFORMATION_PAGE, zodError)),
              )
            : of([]),
    ),
);

const hasStudyPeriodValidation$ = Model.studyPeriod.validation$.pipe(
    map((zodError) => getFieldValidationError("Study Period", GENERAL_INFORMATION_PAGE, zodError)),
);

const constructionPeriodValidation$ = Model.constructionPeriod.validation$.pipe(
    map((zodError) => getFieldValidationError("Construction Period", GENERAL_INFORMATION_PAGE, zodError)),
);

const hasDiscountingMethod$ = Model.discountingMethod.$.pipe(
    tap((e) => console.log(e)),
    map((discountingMethod) =>
        discountingMethod === undefined
            ? [{ url: GENERAL_INFORMATION_PAGE, messages: ["Discounting Convention - Required"] }]
            : [],
    ),
);

const zipCodeValidation$ = Model.Location.zipcode.validation$.pipe(
    map((zodError) => getFieldValidationError("Zipcode", GENERAL_INFORMATION_PAGE, zodError)),
);

/* RATES VALIDATION */

const realDiscountRateValidation$ = Model.realDiscountRate.validation$.pipe(
    map((zodError) => getFieldValidationError("Real Discount Rate", GENERAL_INFORMATION_PAGE, zodError)),
);

const nominalDiscountRateValidation$ = Model.nominalDiscountRate.validation$.pipe(
    map((zodError) => getFieldValidationError("Nominal Discount Rate", GENERAL_INFORMATION_PAGE, zodError)),
);

const inflationRateValidation$ = Model.inflationRate.validation$.pipe(
    map((zodError) => getFieldValidationError("Inflation Rate", GENERAL_INFORMATION_PAGE, zodError)),
);

const currentMethodValidation$ = nominalDiscountRateValidation$.pipe(
    mergeMap((nominalDiscountRateError) =>
        inflationRateValidation$.pipe(map((inflationRateError) => nominalDiscountRateError.concat(inflationRateError))),
    ),
);

export const ratesValidation$ = Model.dollarMethod.$.pipe(
    switchMap((dollarMethod) =>
        dollarMethod === DollarMethod.CONSTANT ? realDiscountRateValidation$ : currentMethodValidation$,
    ),
);

/* PROJECT-WIDE */

const moreThanTwoAlternatives$: Observable<Error[]> = alternatives$.pipe(
    map((arr) =>
        arr.length < 2 ? [{ url: ALTERNATIVE_SUMMARY_PAGE, messages: ["Need more than one alternative"] }] : [],
    ),
);

const alternativeCostValidation$ = alternatives$.pipe(
    map((alternatives) =>
        alternatives.reduce((errors, alternative) => {
            if (alternative.costs.length < 1)
                errors.push({
                    url: `${ALTERNATIVE_SUMMARY_PAGE}${alternative.id}`,
                    messages: ["Need at least one cost per alternative"],
                });
            return errors;
        }, [] as Error[]),
    ),
);

const hasBaselineValidation$ = hasBaseline$.pipe(
    map((hasBaseline) =>
        hasBaseline ? [{ url: ALTERNATIVE_SUMMARY_PAGE, messages: ["Must have a baseline alternative"] }] : [],
    ),
);

/* ------------ ERROR STREAM ------------ */

export const errors$ = combineLatest([
    analysisTypeValidation$,
    analysisPurposeValidation$,
    hasStudyPeriodValidation$,
    constructionPeriodValidation$,
    hasDiscountingMethod$,
    zipCodeValidation$,
    ratesValidation$,
    moreThanTwoAlternatives$,
    alternativeCostValidation$,
    hasBaselineValidation$,
]).pipe(map((errors) => errors.flat()));
