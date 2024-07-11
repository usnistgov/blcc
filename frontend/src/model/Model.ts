import { bind, shareLatest, state } from "@react-rxjs/core";
import {
    AnalysisType,
    type DiscountingMethod,
    DollarMethod,
    EmissionsRateScenario,
    type NonUSLocation,
    type Project,
    Purpose,
    SocialCostOfGhgScenario,
    type USLocation,
} from "blcc-format/Format";
import { Country, type State } from "constants/LOCATION";
import { type Collection, liveQuery } from "dexie";
import { db } from "model/db";
import objectHash from "object-hash";
import { NEVER, Subject, combineLatest, distinctUntilChanged, from, map, merge, of, switchMap } from "rxjs";
import { ajax } from "rxjs/internal/ajax/ajax";
import { catchError, filter, shareReplay, startWith, withLatestFrom } from "rxjs/operators";
import { defaultValue, guard } from "util/Operators";

export const currentProject$ = NEVER.pipe(startWith(1), shareReplay(1));

const projectCollection$ = currentProject$.pipe(map((id) => db.projects.where("id").equals(id)));

const dbProject$ = currentProject$.pipe(
    switchMap((currentID) => liveQuery(() => db.projects.where("id").equals(currentID).first())),
    guard(),
);

export const [useProject, project$] = bind(dbProject$, undefined);

export const alternativeIDs$ = dbProject$.pipe(map((p) => p.alternatives));
export const [useAlternativeIDs] = bind(alternativeIDs$, []);

export const alternatives$ = alternativeIDs$.pipe(
    switchMap((ids) => liveQuery(() => db.alternatives.where("id").anyOf(ids).toArray())),
    shareLatest(),
);
export const [useAlternatives, alt$] = bind(alternatives$, []);

export const baselineID$ = alternatives$.pipe(
    map((alternatives) => alternatives.find((alternative) => alternative.baseline)?.id ?? -1),
);

export const costIDs$ = dbProject$.pipe(map((p) => p.costs));
export const [useCostIDs] = bind(costIDs$, []);

export const costs$ = costIDs$.pipe(switchMap((ids) => liveQuery(() => db.costs.where("id").anyOf(ids).toArray())));

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

// Creates a hash of the current project
export const hash$ = combineLatest([project$, alternatives$, costs$]).pipe(
    map(([project, alternatives, costs]) => {
        if (project === undefined) throw "Project is undefined";

        return objectHash({ project, alternatives, costs });
    }),
);

export const isDirty$ = hash$.pipe(
    switchMap((hash) => from(liveQuery(() => db.dirty.get(hash)))),
    map((result) => result === undefined),
);

/*alternatives$
    .pipe(
        validate({
            name: "At least one baseline alternative",
            test: (alts) => alts.find((alt) => alt.baseline) !== undefined,
            message: () => "Must have at least one baseline alternative",
        }),
        withLatestFrom(from(liveQuery(() => db.errors.where("id").equals("Has Baseline").toArray()))),
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
*/

export namespace Model {
    export namespace Location {
        export const location$ = dbProject$.pipe(map((p) => p.location));

        /**
         * The country of the current project
         */
        export const sCountry$ = new Subject<Country>();
        export const country$ = state(
            merge(sCountry$, location$.pipe(map((p) => p.country))).pipe(distinctUntilChanged()),
            Country.USA,
        );
        sCountry$
            .pipe(withLatestFrom(projectCollection$))
            .subscribe(([country, collection]) => collection.modify({ "location.country": country }));

        /**
         * The city of the current project
         */
        export const sCity$ = new Subject<string | undefined>();
        export const city$ = state(
            merge(sCity$, location$.pipe(map((p) => p.city))).pipe(distinctUntilChanged()),
            undefined,
        );
        sCity$.pipe(withLatestFrom(projectCollection$)).subscribe(([city, collection]) =>
            collection.modify((project) => {
                project.location.city = city;
            }),
        );

        export const usLocation$ = location$.pipe(
            filter((location): location is USLocation => location.country === Country.USA),
        );
        export const nonUSLocation$ = location$.pipe(
            filter((location): location is NonUSLocation => location.country !== Country.USA),
        );

        /**
         * The state of the current project
         */
        export const sState$ = new Subject<State>();
        export const state$ = merge(sState$, usLocation$.pipe(map((usLocation) => usLocation.state))).pipe(
            distinctUntilChanged(),
        );
        sState$
            .pipe(withLatestFrom(projectCollection$))
            .subscribe(([state, collection]) => collection.modify({ "location.state": state }));

        /**
         * The State or Province when the location is non-US.
         */
        export const sStateOrProvince$ = new Subject<string | undefined>();
        export const stateOrProvince$ = state(
            merge(sStateOrProvince$, nonUSLocation$.pipe(map((nonUSLocation) => nonUSLocation.stateProvince))).pipe(
                distinctUntilChanged(),
            ),
            undefined,
        );
        sStateOrProvince$.pipe(withLatestFrom(projectCollection$)).subscribe(([stateOrProvince, collection]) =>
            collection.modify((project) => {
                if (stateOrProvince === undefined) return;

                (project.location as NonUSLocation).stateProvince = stateOrProvince;
            }),
        );

        /**
         * The zipcode of the current project's location
         */
        export const sZip$ = new Subject<string | undefined>();
        export const zip$ = state(
            merge(sZip$, usLocation$.pipe(map((p) => p.zipcode))).pipe(distinctUntilChanged()),
            undefined,
        );
        sZip$.pipe(withLatestFrom(projectCollection$)).subscribe(([zipcode, collection]) =>
            collection.modify((project) => {
                (project.location as USLocation).zipcode = zipcode;
            }),
        );
    }

    /**
     * The name of the current project.
     */
    export const sName$ = new Subject<string | undefined>();
    const newName$ = sName$.pipe(defaultValue("Untitled Project"));
    export const [useName, name$] = bind(
        merge(newName$, dbProject$.pipe(map((p) => p.name))).pipe(distinctUntilChanged()),
        undefined,
    );
    newName$.pipe(withLatestFrom(projectCollection$)).subscribe(([name, collection]) => collection.modify({ name }));

    /**
     * The analyst for the current project
     */
    export const sAnalyst$ = new Subject<string | undefined>();
    export const analyst$ = state(
        merge(sAnalyst$, dbProject$.pipe(map((p) => p?.analyst))).pipe(distinctUntilChanged()),
        undefined,
    );
    sAnalyst$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([analyst, collection]) => collection.modify({ analyst }));

    /**
     * The description of the current project
     */
    export const sDescription$ = new Subject<string | undefined>();
    export const description$ = state(
        merge(sDescription$, dbProject$.pipe(map((p) => p?.description))).pipe(distinctUntilChanged()),
        undefined,
    );
    sDescription$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([description, collection]) => collection.modify({ description }));

    /**
     * Get the release years of the data that are available
     */
    type ReleaseYearResponse = { year: number; max: number; min: number };
    export const releaseYearsResponse$ = ajax.getJSON<ReleaseYearResponse[]>("/api/release_year");
    export const releaseYears$ = releaseYearsResponse$.pipe(
        map((result) => (result === null ? [2023] : result.map((r) => r.year))),
    );
    export const sReleaseYear$ = new Subject<number>();
    export const releaseYear$ = merge(sReleaseYear$, dbProject$.pipe(map((p) => p.releaseYear))).pipe(
        distinctUntilChanged(),
    );
    sReleaseYear$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([releaseYear, collection]) => collection.modify({ releaseYear }));
    export const defaultReleaseYear$ = releaseYears$.pipe(
        map((years) => years[0]),
        catchError(() => of(new Date().getFullYear())),
    );

    /**
     * The study period of the current project.
     */
    export const sStudyPeriod$ = new Subject<number | undefined>();
    export const studyPeriod$ = state(
        merge(sStudyPeriod$, dbProject$.pipe(map((p) => p.studyPeriod))).pipe(distinctUntilChanged()),
        25,
    );
    sStudyPeriod$
        .pipe(
            //map((studyPeriod) => (studyPeriod ? Math.trunc(studyPeriod) : undefined)),
            withLatestFrom(projectCollection$),
        )
        .subscribe(([studyPeriod, collection]) => collection.modify({ studyPeriod }));

    /**
     * The construction period of the current project
     */
    export const sConstructionPeriod$ = new Subject<number>();
    export const constructionPeriod$ = state(
        merge(sConstructionPeriod$, dbProject$.pipe(map((p) => p.constructionPeriod))).pipe(distinctUntilChanged()),
        0,
    );
    sConstructionPeriod$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([constructionPeriod, collection]) => collection.modify({ constructionPeriod }));

    /**
     * The analysis type of the current project.
     */
    export const sAnalysisType$ = new Subject<AnalysisType>();
    export const analysisType$ = state(
        merge(sAnalysisType$, dbProject$.pipe(map((p) => p.analysisType))).pipe(distinctUntilChanged(), guard()),
        undefined,
    );
    sAnalysisType$.pipe(withLatestFrom(projectCollection$)).subscribe((params) => setAnalysisType(params));

    /**
     * The purpose of the current project.
     */
    export const sPurpose$ = new Subject<Purpose>();
    export const purpose$ = state(
        merge(sPurpose$, dbProject$.pipe(map((p) => p.purpose))).pipe(distinctUntilChanged()),
        Purpose.COST_LEASE,
    );
    sPurpose$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([purpose, collection]) => collection.modify({ purpose }));

    /**
     * Inflation rate of the current project
     */
    export const sInflationRate$ = new Subject<number | undefined>();
    export const inflationRate$ = state(
        merge(sInflationRate$, dbProject$.pipe(map((p) => p.inflationRate))).pipe(distinctUntilChanged()),
        undefined,
    );
    sInflationRate$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([inflationRate, collection]) => collection.modify({ inflationRate }));

    /**
     * Nominal Discount Rate of the current project
     */
    export const sNominalDiscountRate$ = new Subject<number | undefined>();
    export const nominalDiscountRate$ = state(
        merge(sNominalDiscountRate$, dbProject$.pipe(map((p) => p.nominalDiscountRate))).pipe(distinctUntilChanged()),
        undefined,
    );
    sNominalDiscountRate$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([nominalDiscountRate, collection]) => collection.modify({ nominalDiscountRate }));

    /**
     * Real discount rate of the current project
     */
    export const sRealDiscountRate$ = new Subject<number | undefined>();
    export const realDiscountRate$ = state(
        merge(sRealDiscountRate$, dbProject$.pipe(map((p) => p.realDiscountRate))).pipe(distinctUntilChanged()),
        undefined,
    );
    sRealDiscountRate$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([realDiscountRate, collection]) => collection.modify({ realDiscountRate }));

    /**
     * The dollar method of the current project
     */
    export const sDollarMethod$ = new Subject<DollarMethod>();
    export const dollarMethod$ = state(
        merge(sDollarMethod$, dbProject$.pipe(map((p) => p.dollarMethod))).pipe(distinctUntilChanged()),
        DollarMethod.CONSTANT,
    );
    sDollarMethod$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([dollarMethod, collection]) => collection.modify({ dollarMethod }));

    /**
     * The discounting method of the current project
     */
    export const sDiscountingMethod$ = new Subject<DiscountingMethod>();
    export const discountingMethod$ = merge(sDiscountingMethod$, dbProject$.pipe(map((p) => p.discountingMethod))).pipe(
        distinctUntilChanged(),
    );
    sDiscountingMethod$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([discountingMethod, collection]) => collection.modify({ discountingMethod }));

    /**
     * The emissions rate scenario of the current project
     */
    export const sEmissionsRateScenario$ = new Subject<EmissionsRateScenario>();
    export const emissionsRateScenario$ = state(
        merge(sEmissionsRateScenario$, dbProject$.pipe(map((p) => p.ghg.emissionsRateScenario))).pipe(
            distinctUntilChanged(),
        ),
        EmissionsRateScenario.BASELINE,
    );
    sEmissionsRateScenario$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([emissionsRateScenario, collection]) =>
            collection.modify({ "ghg.emissionsRateScenario": emissionsRateScenario }),
        );

    // Get the emissions data from the database.
    export const emissions$ = combineLatest([
        Location.zip$.pipe(guard()),
        releaseYear$,
        studyPeriod$,
        emissionsRateScenario$.pipe(map(getEmissionsRateOption), guard()),
    ]).pipe(
        switchMap(([zip, releaseYear, studyPeriod, emissionsRate]) =>
            ajax<number[]>({
                url: "/api/emissions",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {
                    from: releaseYear,
                    to: releaseYear + (studyPeriod ?? 0),
                    release_year: releaseYear,
                    zip: Number.parseInt(zip ?? "0"),
                    case: emissionsRate,
                    rate: "Avg",
                },
            }),
        ),
        map((response) => response.response),
        startWith(undefined),
    );

    export const sSocialCostOfGhgScenario$ = new Subject<SocialCostOfGhgScenario>();
    export const socialCostOfGhgScenario$ = state(
        merge(sSocialCostOfGhgScenario$, dbProject$.pipe(map((p) => p.ghg.socialCostOfGhgScenario))).pipe(
            distinctUntilChanged(),
        ),
    );
    sSocialCostOfGhgScenario$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([socialCostOfGhgScenario, collection]) =>
            collection.modify({ "ghg.socialCostOfGhgScenario": socialCostOfGhgScenario }),
        );

    export const scc$ = combineLatest([
        releaseYear$,
        studyPeriod$,
        socialCostOfGhgScenario$.pipe(map(getSccOption), guard()),
    ]).pipe(
        switchMap(([releaseYear, studyPeriod, option]) =>
            ajax<number[]>({
                url: "/api/scc",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {
                    from: releaseYear,
                    to: releaseYear + (studyPeriod ?? 0),
                    release_year: releaseYear,
                    option,
                },
            }),
        ),
        map((response) => response.response),
        map((dollarsPerMetricTon) => dollarsPerMetricTon.map((value) => value / 1000)),
        startWith(undefined),
    );
}

function setAnalysisType([analysisType, collection]: [AnalysisType, Collection<Project>]) {
    // If OMB_NON_ENERGY, set purpose to default value, otherwise just set analysis type and keep purpose undefined.
    if (analysisType === AnalysisType.OMB_NON_ENERGY)
        collection.modify({
            analysisType,
            purpose: Purpose.INVEST_REGULATION,
        });
    else collection.modify({ analysisType, purpose: undefined });
}
