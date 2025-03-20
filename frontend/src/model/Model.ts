import { bind } from "@react-rxjs/core";
import { Defaults } from "blcc-format/Defaults";
import { DollarMethod, EmissionsRateType, GhgDataSource, type Project } from "blcc-format/Format";
import { showUpdateGeneralOptionsModal } from "components/modal/UpdateGeneralOptionsModal";
import type { Country, State } from "constants/LOCATION";
import { type Collection, liveQuery } from "dexie";
import { Effect } from "effect";
import { isNonUSLocation, isUSLocation } from "model/Guards";
import { DexieService, db } from "model/db";
import * as O from "optics-ts";
import {
    BehaviorSubject,
    NEVER,
    Subject,
    combineLatest,
    distinctUntilChanged,
    from,
    map,
    merge,
    sample,
    switchMap,
} from "rxjs";
import { filter, shareReplay, startWith, withLatestFrom } from "rxjs/operators";
import { BlccApiService } from "services/BlccApiService";
import { guard } from "util/Operators";
import { calculateNominalDiscountRate, calculateRealDiscountRate, findBaselineID } from "util/Util";
import { BlccRuntime } from "util/runtime";
import { DexieModel, Var } from "util/var";
import z from "zod";

export const currentProject$ = NEVER.pipe(startWith(Defaults.PROJECT_ID), shareReplay(1));

export const sProject$ = new Subject<Project>();
export const sProjectCollection$ = new BehaviorSubject<Collection<Project>>(
    db.projects.where("id").equals(Defaults.PROJECT_ID),
);

const DexieModelTest = new DexieModel(sProject$, sProjectCollection$);

export const alternativeIDs$ = sProject$.pipe(map((p) => p.alternatives));
export const [useAlternativeIDs] = bind(alternativeIDs$, []);

export const alternatives$ = from(liveQuery(() => db.alternatives.toArray())).pipe(distinctUntilChanged());
export const [useAlternatives] = bind(alternatives$, []);

export const baselineID$ = alternatives$.pipe(
    map((alternatives) => findBaselineID(alternatives)),
    guard(),
);

export const hasBaseline$ = alternatives$.pipe(map((alternatives$) => findBaselineID(alternatives$) === undefined));
export const [useHasBaseline] = bind(hasBaseline$, false);

export const costIDs$ = sProject$.pipe(map((p) => p.costs));
export const [useCostIDs] = bind(costIDs$, []);

export const hashProject$ = from(liveQuery(() => db.projects.where("id").equals(Defaults.PROJECT_ID).first()));

export const hashAlternatives$ = from(liveQuery(() => db.alternatives.toArray()));

export const hashCosts$ = from(liveQuery(() => db.costs.toArray()));

// Creates a hash of the current project
export const hash$ = combineLatest([hashProject$, hashAlternatives$, hashCosts$]).pipe(
    switchMap(() =>
        BlccRuntime.runPromise(
            Effect.gen(function* () {
                const db = yield* DexieService;
                return yield* db.hashCurrent;
            }).pipe(Effect.catchTag("UndefinedError", () => Effect.succeed(undefined))),
        ),
    ),
    guard(),
    distinctUntilChanged(),
);

export const isDirty$ = hash$.pipe(
    switchMap((hash) => from(liveQuery(() => db.dirty.get(hash)))),
    map((result) => result === undefined),
    distinctUntilChanged(),
    shareReplay(1),
);

export const [useIsDirty] = bind(isDirty$, false);

export type LocationModel<T extends object> = {
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
    export const name = new Var(DexieModelTest, O.optic<Project>().prop("name"), z.string().max(50));

    /**
     * The analyst for the current project
     */
    export const analyst = new Var(DexieModelTest, O.optic<Project>().prop("analyst"));

    /**
     * The description of the current project
     */
    export const description = new Var(DexieModelTest, O.optic<Project>().prop("description"));

    /**
     * The list of all possible release years that we have data for. If an error occurs while fetching the release year
     * the list will be defaulted to 2023.
     */
    export const [useReleaseYearList] = bind(
        from(
            BlccRuntime.runPromise(
                Effect.gen(function* () {
                    const api = yield* BlccApiService;
                    // Get release years and default to [2023] if an error occurs.
                    const releaseYears = yield* api.fetchReleaseYears.pipe(
                        Effect.map((years) => years.map((release) => release.year)),
                        Effect.catchAll(() => Effect.succeed([Defaults.RELEASE_YEAR])),
                    );

                    yield* Effect.log("Got release years", releaseYears);

                    return releaseYears;
                }),
            ),
        ),
        [Defaults.RELEASE_YEAR],
    );

    /**
     * The release year of the current project
     */
    export const releaseYear = new Var(DexieModelTest, O.optic<Project>().prop("releaseYear"));

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

    export const isDollarMethodCurrent$ = dollarMethod.$.pipe(
        map((dollarMethod) => dollarMethod === DollarMethod.CURRENT),
    );
    export const [useIsDollarMethodCurrent] = bind(isDollarMethodCurrent$, false);

    /**
     * The discounting method of the current project
     */
    export const discountingMethod = new Var(DexieModelTest, O.optic<Project>().prop("discountingMethod"));

    /**
     * The data source for the current project.
     */
    export const ghgDataSource = new Var(DexieModelTest, O.optic<Project>().path("ghg.dataSource"));

    /**
     * The Emissions Rate Type for the current project.
     */
    export const emissionsRateType = new Var(DexieModelTest, O.optic<Project>().path("ghg.emissionsRateType"));

    /**
     * Gives the select options for the emissions rate type. If the data source is NIST_NETL, only give the option for
     * Average sine we do not have LRM data for that data source.
     */
    export const [useEmissionsRateOptions] = bind(
        ghgDataSource.$.pipe(
            map((dataSource) =>
                dataSource === GhgDataSource.NIST_NETL ? [EmissionsRateType.AVERAGE] : Object.values(EmissionsRateType),
            ),
        ),
        Object.values(EmissionsRateType),
    );

    /**
     * Stores the escalation rates for *each* sector. We do this since each cost may vary by sector so we need to
     * get the rates or each one.
     */
    export const projectEscalationRates = new Var(DexieModelTest, O.optic<Project>().prop("projectEscalationRates"));

    /**
     * Listen for changes in variables that control escalation rates and fetch new rates if necessary.
     */
    export const escalationRateVars = combineLatest([releaseYear.$, studyPeriod.$, Location.zipcode.$, eiaCase.$]);

    // If the inputs are *not* valid, set the project escalation rates to undefined
    escalationRateVars
        .pipe(filter((values) => !(values[2] !== undefined && values[2].length === 5)))
        .subscribe(() => projectEscalationRates.set(undefined));

    escalationRateVars
        .pipe(
            distinctUntilChanged(),
            // Make sure the zipcode exists and is 5 digits
            filter((values) => values[2] !== undefined && values[2].length === 5),
            switchMap(([releaseYear, studyPeriod, zipcode, eiaCase]) =>
                BlccRuntime.runPromise(
                    Effect.gen(function* () {
                        const api = yield* BlccApiService;

                        yield* Effect.log(
                            "Fetching project escalation rates",
                            releaseYear,
                            studyPeriod,
                            zipcode,
                            eiaCase,
                        );
                        return yield* Effect.orElse(
                            api.fetchEscalationRates(
                                releaseYear,
                                releaseYear,
                                releaseYear + (studyPeriod ?? 0),
                                eiaCase,
                                Number.parseInt(zipcode ?? "0"),
                            ),
                            () =>
                                Effect.andThen(
                                    Effect.log("Failed to fetch escalation rates, defaulting to undefined"),
                                    Effect.succeed(undefined),
                                ),
                        );
                    }),
                ),
            ),
        )
        .subscribe((rates) => projectEscalationRates.set(rates));

    export const updateAnalysisType$ = combineLatest([analysisType.$.pipe(guard()), releaseYear.$, purpose.$]).pipe(
        sample(merge(analysisType.change$, releaseYear.change$, purpose.change$)),
        showUpdateGeneralOptionsModal(),
    );
}
