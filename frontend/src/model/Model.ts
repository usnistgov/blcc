import { bind, shareLatest, state } from "@react-rxjs/core";
import {
    AnalysisType,
    Case,
    DiscountingMethod,
    DollarMethod,
    EmissionsRateType,
    GhgDataSource,
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
import {
    NEVER,
    type Observable,
    Subject,
    combineLatest,
    distinctUntilChanged,
    from,
    map,
    merge,
    of,
    sample,
    switchMap,
} from "rxjs";
import { ajax } from "rxjs/internal/ajax/ajax";
import { catchError, filter, shareReplay, startWith, withLatestFrom } from "rxjs/operators";
import { match } from "ts-pattern";
import { defaultValue, guard } from "util/Operators";
import { calculateNominalDiscountRate, calculateRealDiscountRate, closest } from "util/Util";

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

function createVar<A, B extends keyof A>(name: B, from$: Observable<A>, collection$: Observable<Collection<A>>) {
    const sSubject$ = new Subject<A>();
    const value$ = merge(sSubject$, from$).pipe(distinctUntilChanged());
    const sub = sSubject$
        .pipe(withLatestFrom(collection$))
        .subscribe(([value, collection]) => collection.modify({ [name]: value }));

    return [sSubject$, value$, sub];
}

function zoom<A, B extends keyof A>(name: B, stream$: Observable<A>): Observable<A[B]> {
    return stream$.pipe(map((value) => value[name]));
}

export namespace Model {
    export namespace Location {
        export const location$ = dbProject$.pipe(map((p) => p.location));

        /**
         * The country of the current project
         */
        export const sCountry$ = new Subject<Country>();
        export const country$ = merge(sCountry$, location$.pipe(map((p) => p.country))).pipe(distinctUntilChanged());
        sCountry$
            .pipe(withLatestFrom(projectCollection$))
            .subscribe(([country, collection]) => collection.modify({ "location.country": country }));

        /**
         * The city of the current project
         */
        export const sCity$ = new Subject<string | undefined>();
        export const city$ = merge(sCity$, location$.pipe(map((p) => p.city))).pipe(distinctUntilChanged());
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
        export const stateOrProvince$ = merge(
            sStateOrProvince$,
            nonUSLocation$.pipe(map((nonUSLocation) => nonUSLocation.stateProvince)),
        ).pipe(distinctUntilChanged());
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
        export const zip$ = merge(
            sZip$.pipe(filter((zip) => /^\d+$/.test(zip ?? ""))),
            usLocation$.pipe(map((p) => p.zipcode)),
        ).pipe(distinctUntilChanged());
        sZip$
            .pipe(
                filter((zip) => /^\d+$/.test(zip ?? "")),
                withLatestFrom(projectCollection$),
            )
            .subscribe(([zipcode, collection]) =>
                collection.modify((project) => {
                    (project.location as USLocation).zipcode = zipcode;
                }),
            );
    }

    /**
     * The name of the current project.
     */
    //export const [sName$, name$] = createVar("name", dbProject$, projectCollection$);

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

    type DiscountRateResponse = {
        release_year: number;
        rate: string;
        year: number;
        real: number;
        nominal: number;
        inflation: number;
    };
    export const ombDiscountRates$ = releaseYear$.pipe(
        switchMap((releaseYear) =>
            ajax<DiscountRateResponse[]>({
                url: "/api/discount_rates",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {
                    release_year: releaseYear,
                    rate: "OMB",
                },
            }),
        ),
        map((response) => response.response),
    );
    export const doeDiscountRates$ = releaseYear$.pipe(
        switchMap((releaseYear) =>
            ajax<DiscountRateResponse[]>({
                url: "/api/discount_rates",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {
                    release_year: releaseYear,
                    rate: "DOE",
                },
            }),
        ),
        map((response) => response.response),
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
     * The analysis type of the current project.
     */
    export const sAnalysisType$ = new Subject<AnalysisType>();
    export const analysisType$ = state(
        merge(sAnalysisType$, dbProject$.pipe(map((p) => p.analysisType))).pipe(distinctUntilChanged(), guard()),
        undefined,
    );
    combineLatest([analysisType$.pipe(guard()), ombDiscountRates$, doeDiscountRates$, purpose$.pipe(guard())])
        .pipe(sample(merge(sAnalysisType$, sPurpose$)), withLatestFrom(projectCollection$, studyPeriod$.pipe(guard())))
        .subscribe((params) => setAnalysisType(params));

    /**
     * The case of the project. Usually Reference or LowZTC
     */
    export const sCase$ = new Subject<Case>();
    export const case$ = state(
        merge(sCase$, dbProject$.pipe(map((p) => p.case))).pipe(distinctUntilChanged()),
        Case.REF,
    );
    sCase$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([pCase, collection]) => collection.modify({ case: pCase }));

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
     * Inflation rate of the current project
     */
    export const sInflationRate$ = new Subject<number | undefined>();
    export const inflationRate$ = state(
        merge(sInflationRate$, dbProject$.pipe(map((p) => p.inflationRate))).pipe(distinctUntilChanged()),
        undefined,
    );

    /**
     * Nominal Discount Rate of the current project
     */
    export const sNominalDiscountRate$ = new Subject<number | undefined>();
    export const nominalDiscountRate$ = state(
        merge(sNominalDiscountRate$, dbProject$.pipe(map((p) => p.nominalDiscountRate))).pipe(distinctUntilChanged()),
        undefined,
    );

    /**
     * Real discount rate of the current project
     */
    export const sRealDiscountRate$ = new Subject<number | undefined>();
    export const realDiscountRate$ = state(
        merge(sRealDiscountRate$, dbProject$.pipe(map((p) => p.realDiscountRate))).pipe(distinctUntilChanged()),
        undefined,
    );

    // Inflation rate subscription
    sInflationRate$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([inflationRate, collection]) => collection.modify({ inflationRate }));

    // Nominal discount rate subscription
    dollarMethod$
        .pipe(
            switchMap((method) => {
                if (method === DollarMethod.CURRENT) return sNominalDiscountRate$;

                return combineLatest([realDiscountRate$, inflationRate$]).pipe(
                    map(([real, inflation]) => calculateNominalDiscountRate(real ?? 0, inflation ?? 0)),
                );
            }),
            withLatestFrom(projectCollection$),
        )
        .subscribe(([nominalDiscountRate, collection]) => collection.modify({ nominalDiscountRate }));

    // Real discount rate subscription
    dollarMethod$
        .pipe(
            // If the dollar method is current, calculate the real discount rate from the nominal and inflation rates
            // otherwise just set the real rate
            switchMap((method) => {
                if (method === DollarMethod.CONSTANT) return sRealDiscountRate$;

                return combineLatest([nominalDiscountRate$, inflationRate$]).pipe(
                    map(([nominal, inflation]) => calculateRealDiscountRate(nominal ?? 0, inflation ?? 0)),
                );
            }),
            withLatestFrom(projectCollection$),
        )
        .subscribe(([realDiscountRate, collection]) => collection.modify({ realDiscountRate }));

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

    // Get the emissions data from the database.
    export const emissions$ = combineLatest([Location.zip$.pipe(guard()), releaseYear$, studyPeriod$, case$]).pipe(
        switchMap(([zip, releaseYear, studyPeriod, eiaCase]) => {
            console.log("Getting emissions", zip, releaseYear, studyPeriod, eiaCase);
            return ajax<number[]>({
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
                    case: eiaCase,
                    rate: "Avg",
                },
            });
        }),
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
            collection.modify({
                "ghg.socialCostOfGhgScenario": socialCostOfGhgScenario,
            }),
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

    /**
     * The data source for the current project.
     */
    export const sGhgDataSource$ = new Subject<GhgDataSource>();
    export const ghgDataSource$ = state(
        merge(sGhgDataSource$, dbProject$.pipe(map((p) => p.ghg.dataSource))).pipe(distinctUntilChanged()),
        GhgDataSource.NIST_NETL,
    );
    sGhgDataSource$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([dataSource, collection]) => collection.modify({ "ghg.dataSource": dataSource }));

    /**
     * The Emissions Rate Type for the current project.
     */
    export const sEmissionsRateType$ = new Subject<EmissionsRateType>();
    export const emissionsRateType$ = state(
        merge(sEmissionsRateType$, dbProject$.pipe(map((p) => p.ghg.emissionsRateType))).pipe(distinctUntilChanged()),
        EmissionsRateType.AVERAGE,
    );
    sEmissionsRateType$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([emissionsRateType, collection]) =>
            collection.modify({ "ghg.emissionsRateType": emissionsRateType }),
        );

    /**
     * Sets variables associated with changing the analysis type.
     */
    function setAnalysisType([[analysisType, ombDiscountRates, doeDiscountRates, purpose], collection, studyPeriod]: [
        [AnalysisType, DiscountRateResponse[], DiscountRateResponse[], Purpose],
        Collection<Project>,
        number | undefined,
    ]) {
        console.log(doeDiscountRates);

        match(analysisType)
            .with(AnalysisType.FEDERAL_FINANCED, (analysisType) => {
                collection.modify({
                    analysisType,
                    purpose: undefined,
                    dollarMethod: DollarMethod.CURRENT,
                    discountingMethod: DiscountingMethod.END_OF_YEAR,
                    // real discount rate will automatically be set
                    nominalDiscountRate: 0.032, // 3.2%
                    inflationRate: doeDiscountRates[0].inflation,
                } as Project);
            })
            .with(AnalysisType.FEMP_ENERGY, (analysisType) => {
                collection.modify({
                    analysisType,
                    purpose: undefined,
                    dollarMethod: DollarMethod.CONSTANT,
                    discountingMethod: DiscountingMethod.END_OF_YEAR,
                    realDiscountRate: 0.03, // 3%
                    // nominal discount rate will automatically be set
                    inflationRate: doeDiscountRates[0].inflation,
                } as Project);
            })
            .with(AnalysisType.OMB_NON_ENERGY, (analysisType) => {
                const rate = closest(ombDiscountRates, (rate) => rate.year, studyPeriod ?? 3);
                const realDiscountRate = purpose === Purpose.INVEST_REGULATION ? 0.07 : rate.real;

                if (purpose === Purpose.INVEST_REGULATION)
                    collection.modify({
                        analysisType,
                        purpose,
                        dollarMethod: DollarMethod.CONSTANT,
                        discountingMethod: DiscountingMethod.END_OF_YEAR,
                        realDiscountRate,
                        //nominal discount rate will automatically be set
                        inflationRate: rate.inflation,
                    } as Project);
                else
                    collection.modify({
                        analysisType,
                        purpose: Purpose.COST_LEASE,
                        dollarMethod: DollarMethod.CONSTANT,
                        discountingMethod: DiscountingMethod.END_OF_YEAR,
                        realDiscountRate: rate.real,
                        // nominal discount rate will automatically be set
                        inflationRate: rate.inflation,
                    } as Project);
            })
            .with(AnalysisType.MILCON_ENERGY, (analysisType) => {
                collection.modify({
                    analysisType,
                    purpose: undefined,
                    dollarMethod: DollarMethod.CONSTANT,
                    discountingMethod: DiscountingMethod.MID_YEAR,
                    realDiscountRate: 0.03, // 3%
                    // nominal discount rate will be automatically set
                    inflationRate: doeDiscountRates[0].inflation,
                } as Project);
            })
            .with(AnalysisType.MILCON_NON_ENERGY, (analysisType) => {
                const rate = closest(ombDiscountRates, (rate) => rate.year, studyPeriod ?? 3);

                collection.modify({
                    analysisType,
                    purpose: undefined,
                    dollarMethod: DollarMethod.CONSTANT,
                    discountingMethod: DiscountingMethod.MID_YEAR,
                    realDiscountRate: rate.real,
                    //nominal discount rate will automatically be set
                    inflationRate: rate.inflation,
                } as Project);
            })
            .with(AnalysisType.MILCON_ECIP, (analysisType) => {
                collection.modify({
                    analysisType,
                    purpose: undefined,
                    dollarMethod: DollarMethod.CONSTANT,
                    discountingMethod: DiscountingMethod.MID_YEAR,
                    realDiscountRate: 0.03, // 3%
                    //nominal discount rate will automatically be set
                    inflationRate: doeDiscountRates[0].inflation,
                } as Project);
            })
            .exhaustive();
    }
}
