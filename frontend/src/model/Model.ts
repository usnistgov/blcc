import { selfDependent } from "@react-rxjs/utils";
import { AnalysisType, DiscountingMethod, DollarMethod, Project, USLocation } from "../blcc-format/Format";
import { Country } from "../constants/LOCATION";
import { bind, shareLatest } from "@react-rxjs/core";
import { filter, map } from "rxjs";

const [_p$, connectProject] = selfDependent<Project>();

const _project$ = _p$.pipe(shareLatest());

export { _project$, connectProject };

const [useName, name$] = bind(_project$.pipe(map((p) => p.name)), "Untitled Project");

const [useDescription, description$] = bind(_project$.pipe(map((p) => p.description)), undefined);
const [useAnalyst, analyst$] = bind(_project$.pipe(map((p) => p.analyst)), undefined);
const [useAnalysisType, analysisType$] = bind(
    _project$.pipe(map((p) => p.analysisType)),
    AnalysisType.FEDERAL_FINANCED
);
const [usePurpose, purpose$] = bind(_project$.pipe(map((p) => p.purpose)), undefined);
const [useDollarMethod, dollarMethod$] = bind(_project$.pipe(map((p) => p.dollarMethod)), DollarMethod.CONSTANT);
const [useStudyPeriod, studyPeriod$] = bind(_project$.pipe(map((p) => p.studyPeriod)), 25);
const [useConstructionPeriod, constructionPeriod$] = bind(_project$.pipe(map((p) => p.constructionPeriod)), 0);
const [useDiscountingMethod, discountingMethod$] = bind(
    _project$.pipe(map((p) => p.discountingMethod)),
    DiscountingMethod.END_OF_YEAR
);
const [useRealDiscountRate, realDiscountRate$] = bind(_project$.pipe(map((p) => p.realDiscountRate)), 0.06);
const [useNominalDiscountRate, nominalDiscountRate$] = bind(
    _project$.pipe(map((p) => p.nominalDiscountRate)),
    undefined
);
const [useInflationRate, inflationRate$] = bind(_project$.pipe(map((p) => p.inflationRate)), undefined);
const [useCountry, country$] = bind(_project$.pipe(map((p) => p.location?.country)), Country.USA);
const [useState, state$] = bind(
    _project$.pipe(
        map((p) => {
            if (p.location?.country === Country.USA) return (p.location as USLocation)?.state;

            return p.location?.stateProvince;
        })
    ),
    undefined
);
const [useCity, city$] = bind(_project$.pipe(map((p) => p.location?.city)), undefined);
const [useZip, zip$] = bind(
    _project$.pipe(
        filter((p) => p.location.country === Country.USA),
        map((p) => (p.location as USLocation)?.zipcode)
    ),
    undefined
);
const [useCombinedLocation, combinedLocation$] = bind(_project$.pipe(map((p) => p?.location)), undefined);
const [useModifiedDollarMethod, modifiedDollarMethod$] = bind(_project$.pipe(map((p) => p?.dollarMethod)), undefined);

const [useEmissionsRate, emissionsRate$] = bind(_project$.pipe(map((p) => p.ghg?.emissionsRateScenario)), undefined);
const [useSocialCostRate, socialCostOfGhgScenario$] = bind(
    _project$.pipe(map((p) => p.ghg?.socialCostOfGhgScenario)),
    undefined
);
const [useCombinedGHG, combinedGHG$] = bind(_project$.pipe(map((p) => p?.ghg)), undefined);

const [useAlternatives, alternatives$] = bind(_project$.pipe(map((p) => p.alternatives)), []);
const [useCosts, costs$] = bind(_project$.pipe(map((p) => p.costs)), []);

const Model = {
    project$: _project$,

    name$,
    useName,
    description$,
    useDescription,
    analyst$,
    useAnalyst,
    analysisType$,
    useAnalysisType,
    purpose$,
    usePurpose,
    dollarMethod$,
    useDollarMethod,
    useModifiedDollarMethod,
    modifiedDollarMethod$,
    studyPeriod$,
    useStudyPeriod,
    constructionPeriod$,
    useConstructionPeriod,
    discountingMethod$,
    useDiscountingMethod,
    realDiscountRate$,
    useRealDiscountRate,
    nominalDiscountRate$,
    useNominalDiscountRate,
    inflationRate$,
    useInflationRate,
    country$,
    useCountry,
    city$,
    useCity,
    state$,
    useState,
    useZip,
    zip$,
    useEmissionsRate,
    emissionsRate$,
    useSocialCostRate,
    socialCostOfGhgScenario$,
    useCombinedLocation,
    combinedLocation$,
    useCombinedGHG,
    combinedGHG$,

    alternatives$,
    useAlternatives,
    costs$,
    useCosts
};

export { Model };
