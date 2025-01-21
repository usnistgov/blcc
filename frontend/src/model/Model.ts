import { type StateObservable, bind, shareLatest, state } from "@react-rxjs/core";
import {
    AnalysisType,
    Case,
    DiscountingMethod,
    DollarMethod,
    type Project,
    Purpose,
    SocialCostOfGhgScenario,
} from "blcc-format/Format";
import type { Country, State } from "constants/LOCATION";
import { type Collection, liveQuery } from "dexie";
import { Effect } from "effect";
import { isNonUSLocation, isUSLocation } from "model/Guards";
import { db, getProject } from "model/db";
import objectHash from "object-hash";
import * as O from "optics-ts";
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
    scan,
    switchMap,
} from "rxjs";
import { ajax } from "rxjs/internal/ajax/ajax";
import { catchError, shareReplay, startWith, withLatestFrom } from "rxjs/operators";
import { match } from "ts-pattern";
import { DexieOps, guard } from "util/Operators";
import { calculateNominalDiscountRate, calculateRealDiscountRate, closest, getResponse } from "util/Util";
import z, { type ZodError, type ZodType } from "zod";

type ReleaseYearResponse = { year: number; max: number; min: number };

type DiscountRateResponse = {
    release_year: number;
    rate: string;
    year: number;
    real: number;
    nominal: number;
    inflation: number;
};

export const currentProject$ = NEVER.pipe(startWith(1), shareReplay(1));
/*
const projectCollection$ = currentProject$.pipe(DexieOps.byId(db.projects));
export const [useProject, dbProject$] = bind(projectCollection$.pipe(DexieOps.first()));

*/
export class DexieModel<T> {
    private sModify$: Subject<(t: T) => T> = new Subject<(t: T) => T>();
    $: Observable<T>;

    constructor(getter$: Observable<T>) {
        this.$ = getter$.pipe(
            switchMap((value) =>
                this.sModify$.pipe(
                    scan((acc, modifier) => modifier(acc), value),
                    startWith(value),
                ),
            ),
            shareReplay(1),
        );
    }

    modify(modifier: (t: T) => T) {
        this.sModify$.next(modifier);
    }
}

export const sProject$ = new Subject<Project>();
export const sProjectCollection$ = new Subject<Collection<Project>>();
export const [useProject] = bind(sProject$);

const DexieModelTest = new DexieModel(sProject$);
// Write changes back to database
DexieModelTest.$.pipe(withLatestFrom(sProjectCollection$)).subscribe(([next, collection]) => {
    collection.modify(next);
});

export class ModelType<A> {
    subject: Subject<A> = new Subject<A>();
    use: () => A;
    $: StateObservable<A>;

    constructor() {
        const [hook, stream$] = bind(this.subject);

        this.use = hook;
        this.$ = stream$;
    }
}

export class Var<A, B> {
    model: DexieModel<A>;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    optic: O.Lens<A, any, B> | O.Prism<A, any, B>;
    use: () => B;
    $: Observable<B>;
    schema?: ZodType;
    useValidation: () => ZodError | undefined;
    validation$: Observable<ZodError | undefined>;

    constructor(
        model: DexieModel<A>,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        optic: O.Lens<A, any, B> | O.Prism<A, any, B>,
        schema: ZodType | undefined = undefined,
    ) {
        const getter = match(optic)
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .with({ _tag: "Lens" }, (optic: O.Lens<A, any, B>) => (a: A) => O.get(optic)(a))
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .with({ _tag: "Prism" }, (optic: O.Prism<A, any, B>) => (a: A) => O.preview(optic)(a))
            .otherwise(() => {
                throw new Error("Invalid optic type");
            });

        const [hook, stream$] = bind(
            model.$.pipe(
                map((a) => getter(a)),
                distinctUntilChanged(),
            ),
        );

        this.model = model;
        this.optic = optic;
        // @ts-ignore
        this.use = hook;
        // @ts-ignore
        this.$ = stream$;
        this.schema = schema;
        const [useValidation, validation$] = bind(
            stream$.pipe(
                map((value) => {
                    try {
                        schema?.parse(value);
                        return undefined;
                    } catch (e) {
                        return e as ZodError;
                    }
                }),
            ),
        );
        this.useValidation = useValidation;
        this.validation$ = validation$;
    }

    set(value: B) {
        this.model.modify((a) => O.set(this.optic)(value)(a));
    }

    remove() {
        match(this.optic)
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .with({ _tag: "Prism" }, (optic: O.Prism<A, any, B>) => this.model.modify((a) => O.remove(optic)(a)))
            .otherwise(() => {});
    }
}

export const alternativeIDs$ = sProject$.pipe(map((p) => p.alternatives));
export const [useAlternativeIDs] = bind(alternativeIDs$, []);

export const alternatives$ = alternativeIDs$.pipe(
    switchMap((ids) => liveQuery(() => db.alternatives.where("id").anyOf(ids).toArray())),
    shareLatest(),
);
export const [useAlternatives, alt$] = bind(alternatives$, []);

export const baselineID$ = alternatives$.pipe(
    map((alternatives) => alternatives.find((alternative) => alternative.baseline)?.id ?? -1),
);

export const costIDs$ = sProject$.pipe(map((p) => p.costs));
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
export const hash$ = combineLatest([sProject$, alternatives$, costs$]).pipe(
    map(([project, alternatives, costs]) => {
        if (project === undefined) throw "Project is undefined";

        return objectHash({ project, alternatives, costs });
    }),
);

export const isDirty$ = hash$.pipe(
    switchMap((hash) => from(liveQuery(() => db.dirty.get(hash)))),
    map((result) => result === undefined),
    shareReplay(1),
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

export type LocationModel<T> = {
    country: Var<T, Country | undefined>;
    city: Var<T, string | undefined>;
    state: Var<T, State | undefined>;
    stateProvince: Var<T, string | undefined>;
    zipcode: Var<T, string | undefined>;
};

export namespace Model {
    const locationOptic = O.optic<Project>().prop("location");

    export const location = new Var(DexieModelTest, locationOptic);

    export const Location: LocationModel<Project> = {
        /**
         * The country of the current project
         */
        country: new Var(DexieModelTest, locationOptic.prop("country")),

        /**
         * The city of the current project
         */
        city: new Var(DexieModelTest, locationOptic.prop("city")),

        /**
         * The state of the current project
         */
        state: new Var(DexieModelTest, locationOptic.guard(isUSLocation).prop("state")),

        /**
         * The State or Province when the location is non-US.
         */
        stateProvince: new Var(DexieModelTest, locationOptic.guard(isNonUSLocation).prop("stateProvince")),

        /**
         * The zipcode of the current project's location
         */
        zipcode: new Var(DexieModelTest, locationOptic.guard(isUSLocation).prop("zipcode"), z.string().max(5)),
    };

    /**
     * The name of the current project.
     */
    export const name = new Var(DexieModelTest, O.optic<Project>().prop("name"), z.string().max(10));

    /**
     * The analyst for the current project
     */
    export const analyst = new Var(DexieModelTest, O.optic<Project>().prop("analyst"));

    /**
     * The description of the current project
     */
    export const description = new Var(DexieModelTest, O.optic<Project>().prop("description"));

    function unwrapReleaseYearResponse(result: ReleaseYearResponse[]) {
        return result === null ? [2023] : result.map((r) => r.year);
    }

    export const [useReleaseYearList, releaseYearList$] = bind(
        ajax.getJSON<ReleaseYearResponse[]>("/api/release_year").pipe(map(unwrapReleaseYearResponse), shareReplay(1)),
    );

    /**
     * The release year of the current project
     */
    export const releaseYear = new Var(DexieModelTest, O.optic<Project>().prop("releaseYear"));

    /**
     * The release year to use as the default. Either the earliest release year or the current year.
     */
    export const defaultReleaseYear$ = releaseYearList$.pipe(
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
    export const ombDiscountRates$ = releaseYear.$.pipe(
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
        map(getResponse),
    );
    export const doeDiscountRates$ = releaseYear.$.pipe(
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
        map(getResponse),
    );

    /**
     * The study period of the current project.
     */
    export const studyPeriod = new Var(DexieModelTest, O.optic<Project>().prop("studyPeriod"));

    /**
     * The construction period of the current project
     */
    export const constructionPeriod = new Var(DexieModelTest, O.optic<Project>().prop("constructionPeriod"));

    /**
     * The purpose of the current project.
     */
    export const purpose = new Var(DexieModelTest, O.optic<Project>().prop("purpose"));

    /**
     * The analysis type of the current project.
     */
    export const analysisType = new Var(DexieModelTest, O.optic<Project>().prop("analysisType"));

    /*
    export const sAnalysisType$ = new Subject<AnalysisType | undefined>();
    export const [useAnalysisType, analysisType$] = bind(sAnalysisType$);

    initializers.push((project: Project) => sAnalysisType$.next(project.analysisType));
    subscriptions.push(() =>
        combineLatest([analysisType$.pipe(guard()), ombDiscountRates$, doeDiscountRates$, purpose$.pipe(guard())])
            .pipe(
                sample(merge(sAnalysisType$, sPurpose$)),
                withLatestFrom(projectCollection$, studyPeriod$.pipe(guard())),
            )
            .subscribe((params) => setAnalysisType(params)),
    );*/

    /*export const analysisType$ = state(
        merge(sAnalysisType$, dbProject$.pipe(map((p) => p.analysisType))).pipe(distinctUntilChanged(), guard()),
        undefined,
    );
    combineLatest([analysisType$.pipe(guard()), ombDiscountRates$, doeDiscountRates$, purpose$.pipe(guard())])
        .pipe(sample(merge(sAnalysisType$, sPurpose$)), withLatestFrom(projectCollection$, studyPeriod$.pipe(guard())))
        .subscribe((params) => setAnalysisType(params));
*/
    /**
     * The case of the project. Usually Reference or LowZTC
     */
    export const eiaCase = new Var(DexieModelTest, O.optic<Project>().prop("case"));

    /**
     * The dollar method of the current project
     */
    export const dollarMethod = new Var(DexieModelTest, O.optic<Project>().prop("dollarMethod"));

    /**
     * Inflation rate of the current project
     */
    export const inflationRate = new Var(DexieModelTest, O.optic<Project>().prop("inflationRate"));

    /**
     * Nominal Discount Rate of the current project
     */
    export const nominalDiscountRate = new Var(DexieModelTest, O.optic<Project>().prop("nominalDiscountRate"));

    /**
     * Real discount rate of the current project
     */
    export const realDiscountRate = new Var(DexieModelTest, O.optic<Project>().prop("realDiscountRate"));

    // Inflation rate subscription
    /*
    sInflationRate$
        .pipe(withLatestFrom(projectCollection$))
        .subscribe(([inflationRate, collection]) => collection.modify({ inflationRate }));

*/
    // Nominal discount rate subscription
    dollarMethod.$.pipe(
        switchMap((method) => {
            if (method === DollarMethod.CURRENT) return nominalDiscountRate.$;

            return combineLatest([realDiscountRate.$, inflationRate.$]).pipe(
                map(([real, inflation]) => calculateNominalDiscountRate(real ?? 0, inflation ?? 0)),
            );
        }),
        withLatestFrom(sProjectCollection$),
    ).subscribe(([nominalDiscountRate, collection]) => collection.modify({ nominalDiscountRate }));

    // Real discount rate subscription
    dollarMethod.$.pipe(
        // If the dollar method is current, calculate the real discount rate from the nominal and inflation rates
        // otherwise just set the real rate
        switchMap((method) => {
            if (method === DollarMethod.CONSTANT) return realDiscountRate.$;

            return combineLatest([nominalDiscountRate.$, inflationRate.$]).pipe(
                map(([nominal, inflation]) => calculateRealDiscountRate(nominal ?? 0, inflation ?? 0)),
            );
        }),
        withLatestFrom(sProjectCollection$),
    ).subscribe(([realDiscountRate, collection]) => collection.modify({ realDiscountRate }));

    /**
     * The discounting method of the current project
     */
    export const discountingMethod = new Var(DexieModelTest, O.optic<Project>().prop("discountingMethod"));

    // Get the emissions data from the database.
    export const emissions$ = combineLatest([
        Location.zipcode.$.pipe(guard()),
        releaseYear.$,
        studyPeriod.$,
        eiaCase.$,
    ]).pipe(
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
        map(getResponse),
        startWith(undefined),
    );

    export const socialCostOfGhgScenario = new Var(
        DexieModelTest,
        O.optic<Project>().path("ghg.socialCostOfGhgScenario"),
    );

    export const scc$ = combineLatest([
        releaseYear.$,
        studyPeriod.$,
        socialCostOfGhgScenario.$.pipe(map(getSccOption), guard()),
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
        map(getResponse),
        map((dollarsPerMetricTon) => dollarsPerMetricTon.map((value) => value / 1000)),
        startWith(undefined),
    );

    /**
     * The data source for the current project.
     */
    export const ghgDataSource = new Var(DexieModelTest, O.optic<Project>().path("ghg.dataSource"));

    /**
     * The Emissions Rate Type for the current project.
     */
    export const emissionsRateType = new Var(DexieModelTest, O.optic<Project>().path("ghg.emissionsRateType"));

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
