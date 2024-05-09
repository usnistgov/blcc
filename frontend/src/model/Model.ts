import { bind } from "@react-rxjs/core";
import { combineLatest, from, map, merge, NEVER, of, switchMap } from "rxjs";
import { liveQuery } from "dexie";
import { db } from "./db";
import { guard } from "../util/Operators";
import {
    AnalysisType,
    DiscountingMethod,
    DollarMethod,
    EmissionsRateScenario,
    type NonUSLocation,
    SocialCostOfGhgScenario,
    type USLocation
} from "../blcc-format/Format";
import { Country } from "../constants/LOCATION";
import { catchError, filter, startWith, withLatestFrom } from "rxjs/operators";
import { ajax } from "rxjs/internal/ajax/ajax";
import { validate } from "./rules/Rules";
import objectHash from "object-hash";

type ReleaseYearResponse = { year: number; max: number; min: number };

export const releaseYearsResponse$ = ajax.getJSON<ReleaseYearResponse[]>("/api/release_year");

export const releaseYears$ = releaseYearsResponse$.pipe(map((result) => result === null ? [2023] : result.map((r) => r.year)));
export const [useReleaseYears] = bind(releaseYears$, []);

export const defaultReleaseYear$ = releaseYears$.pipe(
    map((years) => years[0]),
    catchError(() => of(new Date().getFullYear()))
);

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
export const [useAlternatives, alt$] = bind(alternatives$, []);

export const baselineID$ = alternatives$.pipe(
    map((alternatives) => alternatives.find((alternative) => alternative.baseline)?.id ?? -1)
);

export const costIDs$ = dbProject$.pipe(map((p) => p.costs));
export const [useCostIDs] = bind(costIDs$, []);

export const costs$ = costIDs$.pipe(switchMap((ids) => liveQuery(() => db.costs.where("id").anyOf(ids).toArray())));

export const releaseYear$ = dbProject$.pipe(map((p) => p.releaseYear));

export const getEmissionsRateOption = (option: EmissionsRateScenario | undefined) => {
    switch (option) {
        case EmissionsRateScenario.BASELINE:
            return "REF";
        case EmissionsRateScenario.LOW_RENEWABLE:
            return "LRC";
        default:
            return undefined;
    }
};

// Get the emissions data from the database.
export const emissions$ = combineLatest([
    zip$.pipe(guard()),
    releaseYear$,
    studyPeriod$,
    emissionsRate$.pipe(map(getEmissionsRateOption), guard())
]).pipe(
    switchMap(([zip, releaseYear, studyPeriod, emissionsRate]) =>
        ajax<number[]>({
            url: "/api/emissions",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                from: releaseYear,
                to: releaseYear + (studyPeriod ?? 0),
                release_year: releaseYear,
                zip: Number.parseInt(zip ?? "0"),
                case: emissionsRate,
                rate: "Avg"
            }
        })
    ),
    map((response) => response.response),
    startWith(undefined)
);

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
    studyPeriod$,
    socialCostOfGhgScenario$.pipe(map(getSccOption), guard())
]).pipe(
    switchMap(([releaseYear, studyPeriod, option]) =>
        ajax<number[]>({
            url: "/api/scc",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: {
                from: releaseYear,
                to: releaseYear + (studyPeriod ?? 0),
                release_year: releaseYear,
                option
            }
        })
    ),
    map((response) => response.response),
    map((dollarsPerMetricTon) => dollarsPerMetricTon.map((value) => value / 1000)),
    startWith(undefined)
);

// Creates a hash of the current project
export const hash$ = combineLatest([project$, alternatives$, costs$]).pipe(
    map(([project, alternatives, costs]) => {
        if (project === undefined) throw "Project is undefined";

        return objectHash({ project, alternatives, costs });
    })
);

export const isDirty$ = hash$.pipe(
    switchMap((hash) => from(liveQuery(() => db.dirty.get(hash)))),
    map((result) => result === undefined)
);

alternatives$
    .pipe(
        validate({
            name: "At least one baseline alternative",
            test: (alts) => alts.find((alt) => alt.baseline) !== undefined,
            message: () => "Must have at least one baseline alternative"
        }),
        withLatestFrom(from(liveQuery(() => db.errors.where("id").equals("Has Baseline").toArray())))
    )
    .subscribe(([result, dbValue]) => {
        if (result === undefined) return;

        const collection = db.errors.where("id").equals("Has Baseline");

        // If the validation succeeded, remove error from db
        if (result.valid) collection.delete();

        // If an entry does not exist for this input, add it to the db
        if (dbValue.length <= 0)
            db.errors.add({ id: "Has Baseline", url: "/editor/alternative", messages: result.messages ?? [] });

        // If an entry exists but the error message has changed, update it
        collection.modify({ messages: result.messages ?? [] });
    });

export const [isLoaded, loaded] = bind(
    combineLatest([dbProject$, alt$.pipe(filter((x) => x.length > 0))]).pipe(map(() => true)),
    false
);

loaded.subscribe((value) => console.log("loaded", value))

alternatives$.subscribe((alts) => console.log("alts", alts))
alt$.subscribe((alts) => console.log("bind alt", alts))
