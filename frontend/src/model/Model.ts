import { bind } from "@react-rxjs/core";
import { combineLatest, map, NEVER, of, switchMap, tap } from "rxjs";
import { liveQuery } from "dexie";
import { db } from "./db";
import { guard } from "../util/Operators";
import {
    AnalysisType,
    DiscountingMethod,
    DollarMethod,
    NonUSLocation,
    SocialCostOfGhgScenario,
    USLocation
} from "../blcc-format/Format";
import { Country } from "../constants/LOCATION";
import { catchError, filter, startWith } from "rxjs/operators";
import { ajax } from "rxjs/internal/ajax/ajax";

type ReleaseYearReponse = { year: number; max: number; min: number };

export const releaseYearsResponse$ = ajax.getJSON<ReleaseYearReponse[]>("/api/release_year");

export const releaseYears$ = releaseYearsResponse$.pipe(map((result) => result.map((r) => r.year)));

export const defaultReleaseYear$ = releaseYears$.pipe(
    map((years) => years[0]),
    catchError(() => of(new Date().getFullYear()))
);

defaultReleaseYear$.subscribe(console.log);

export const currentProject$ = NEVER.pipe(startWith(1));

const dbProject$ = currentProject$.pipe(
    switchMap((currentID) => liveQuery(() => db.projects.where("id").equals(currentID).first())),
    guard()
);

export const [useProject, project$] = bind(dbProject$, undefined);

export const name$ = dbProject$.pipe(map((p) => p.name));
export const [useName] = bind(name$, "");

export const analyst$ = dbProject$.pipe(map((p) => p.analyst));
export const [useAnalyst] = bind(analyst$, undefined);

export const description$ = dbProject$.pipe(map((p) => p.description));
export const [useDescription] = bind(description$, undefined);

export const analysisType$ = dbProject$.pipe(map((p) => p.analysisType));
export const [useAnalysisType] = bind(analysisType$, AnalysisType.FEDERAL_FINANCED);

export const analysisYear$ = dbProject$.pipe(map((p) => p?.analysisYear));
export const [useAnalysisYear] = bind(analysisYear$, 1990);

export const purpose$ = dbProject$.pipe(map((p) => p.purpose));
export const [usePurpose] = bind(purpose$, undefined);

export const studyPeriod$ = dbProject$.pipe(map((p) => p.studyPeriod));
export const [useStudyPeriod] = bind(studyPeriod$, 25);

export const constructionPeriod$ = dbProject$.pipe(map((p) => p.constructionPeriod));
export const [useConstructionPeriod] = bind(constructionPeriod$, 0);

export const dollarMethod$ = dbProject$.pipe(map((p) => p.dollarMethod));
export const [useDollarMethod] = bind(dollarMethod$, DollarMethod.CONSTANT);

export const inflationRate$ = dbProject$.pipe(map((p) => p.inflationRate));
export const [useInflationRate] = bind(inflationRate$, undefined);

export const nominalDiscountRate$ = dbProject$.pipe(map((p) => p.nominalDiscountRate));
export const [useNominalDiscountRate] = bind(nominalDiscountRate$, undefined);

export const realDiscountRate$ = dbProject$.pipe(map((p) => p.realDiscountRate));
export const [useRealDiscountRate] = bind(realDiscountRate$, undefined);

export const discountingMethod$ = dbProject$.pipe(map((p) => p.discountingMethod));
export const [useDiscountingMethod] = bind(discountingMethod$, DiscountingMethod.END_OF_YEAR);

export const location$ = dbProject$.pipe(map((p) => p.location));

export const country$ = location$.pipe(map((p) => p.country));
export const [useCountry] = bind(country$, Country.USA);

export const city$ = location$.pipe(map((p) => p.city));
export const usLocation$ = location$.pipe(
    filter((location): location is USLocation => location.country === Country.USA)
);
export const nonUSLocation$ = location$.pipe(
    filter((location): location is NonUSLocation => location.country !== Country.USA)
);
export const state$ = usLocation$.pipe(map((usLocation) => usLocation.state));
export const stateOrProvince$ = nonUSLocation$.pipe(map((nonUSLocation) => nonUSLocation.stateProvince));
export const zip$ = usLocation$.pipe(map((p) => p.zipcode));

export const emissionsRate$ = dbProject$.pipe(map((p) => p.ghg.emissionsRateScenario));
export const socialCostOfGhgScenario$ = dbProject$.pipe(map((p) => p.ghg.socialCostOfGhgScenario));

export const alternativeIDs$ = dbProject$.pipe(map((p) => p.alternatives));
export const [useAlternativeIDs] = bind(alternativeIDs$, []);

export const alternatives$ = alternativeIDs$.pipe(
    switchMap((ids) => liveQuery(() => db.alternatives.where("id").anyOf(ids).toArray()))
);
export const [useAlternatives] = bind(alternatives$, []);

export const baselineID$ = alternatives$.pipe(
    map((alternatives) => alternatives.find((alternative) => alternative.baseline)?.id ?? -1)
);

export const costIDs$ = dbProject$.pipe(map((p) => p.costs));
export const [useCostIDs] = bind(costIDs$, []);

export const costs$ = costIDs$.pipe(switchMap((ids) => liveQuery(() => db.costs.where("id").anyOf(ids).toArray())));

export const releaseYear$ = dbProject$.pipe(map((p) => p.releaseYear));

// Get the emissions data from the database.
export const emissions$ = combineLatest([zip$.pipe(guard()), releaseYear$, analysisYear$, studyPeriod$]).pipe(
    switchMap(([zip, releaseYear, analysisYear, studyPeriod]) =>
        ajax<number[]>({
            url: "/api/emissions",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                from: analysisYear,
                to: analysisYear + studyPeriod,
                release_year: releaseYear,
                zip: Number.parseInt(zip ?? "0"),
                case: "REF",
                rate: "Avg"
            }
        })
    ),
    map((response) => response.response)
);

emissions$.subscribe((v) => console.log("Emissions", v));

const getSccOption = (option: SocialCostOfGhgScenario | undefined): string | undefined => {
    switch (option) {
        case SocialCostOfGhgScenario.LOW:
            return "three_percent_average";
        case SocialCostOfGhgScenario.MEDIUM:
            return "five_percent_average";
        case SocialCostOfGhgScenario.HIGH:
            return "three_percent_ninety_fifth_percentile";
        default:
            return undefined;
    }
};

export const scc$ = combineLatest([
    releaseYear$,
    analysisYear$,
    studyPeriod$,
    socialCostOfGhgScenario$.pipe(map(getSccOption), guard())
]).pipe(
    switchMap(([releaseYear, analysisYear, studyPeriod, option]) =>
        ajax<number[]>({
            url: "/api/scc",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                from: analysisYear,
                to: analysisYear + studyPeriod,
                release_year: releaseYear,
                option
            }
        })
    ),
    map((response) => response.response),
    map((dollarsPerMetricTon) => dollarsPerMetricTon.map((value) => value / 1000))
);

scc$.subscribe((v) => console.log("SCC", v));
