import { bind, shareLatest, state } from "@react-rxjs/core";
import {
    Case,
    CostTypes,
    CustomerSector,
    type EnergyCost,
    EnergyUnit,
    FuelType,
    GhgDataSource,
    type NonUSLocation,
    type USLocation,
    type Unit,
    EmissionsRateType,
} from "blcc-format/Format";
import { Country, type State } from "constants/LOCATION";
import { CostModel } from "model/CostModel";
import { Model } from "model/Model";
import { type Observable, Subject, combineLatest, distinctUntilChanged, map, merge, of, switchMap } from "rxjs";
import { ajax } from "rxjs/internal/ajax/ajax";
import { catchError, combineLatestWith, filter, shareReplay, startWith, tap, withLatestFrom } from "rxjs/operators";
import { match } from "ts-pattern";
import { guard } from "util/Operators";
import { COAL_KG_CO2_PER_MEGAJOULE } from "util/UnitConversion";
import { ajaxDefault } from "util/Util";

export namespace EnergyCostModel {
    /**
     * Outputs a value if the current cost is an energy cost
     */
    export const cost$ = CostModel.cost$.pipe(filter((cost): cost is EnergyCost => cost.type === CostTypes.ENERGY));

    // Location override
    export namespace Location {
        export const sToggleLocation$ = new Subject<boolean>();
        sToggleLocation$
            .pipe(withLatestFrom(CostModel.collection$, Model.Location.location$))
            .subscribe(([toggle, collection, projectLocation]) =>
                collection.modify({
                    location: toggle ? { ...projectLocation } : undefined,
                }),
            );

        export const location$ = cost$.pipe(map((cost) => cost.location));
        export const customLocation$ = state(location$.pipe(map((location) => location !== undefined)), false);

        export const sCountry$ = new Subject<Country>();
        export const country$ = merge(sCountry$, location$.pipe(map((location) => location?.country))).pipe(
            distinctUntilChanged(),
        );
        sCountry$
            .pipe(withLatestFrom(CostModel.collection$))
            .subscribe(([country, collection]) => collection.modify({ "location.country": country }));

        export const sCity$ = new Subject<string | undefined>();
        export const city$ = merge(sCity$, location$.pipe(map((location) => location?.city)));
        sCity$
            .pipe(withLatestFrom(CostModel.collection$))
            .subscribe(([city, collection]) => collection.modify({ "location.city": city }));

        export const usLocation$ = location$.pipe(
            filter((location): location is USLocation => location?.country === Country.USA),
        );
        export const nonUSLocation$ = location$.pipe(
            filter((location): location is NonUSLocation => location?.country !== Country.USA),
        );

        export const sState$ = new Subject<State>();
        export const state$ = merge(sState$, usLocation$.pipe(map((usLocation) => usLocation.state))).pipe(
            distinctUntilChanged(),
        );
        sState$
            .pipe(withLatestFrom(CostModel.collection$))
            .subscribe(([state, collection]) => collection.modify({ "location.state": state }));

        export const sStateOrProvince$ = new Subject<string | undefined>();
        export const stateOrProvince$ = merge(
            sStateOrProvince$,
            nonUSLocation$.pipe(map((nonUSLocation) => nonUSLocation.stateProvince)),
        ).pipe(distinctUntilChanged());
        sStateOrProvince$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([stateOrProvince, collection]) =>
            collection.modify((project) => {
                if (stateOrProvince === undefined) return;

                (project.location as NonUSLocation).stateProvince = stateOrProvince;
            }),
        );

        export const sZip$ = new Subject<string | undefined>();
        export const zip$ = merge(
            sZip$.pipe(filter((zip) => /^\d+$/.test(zip ?? ""))),
            usLocation$.pipe(map((p) => p.zipcode)),
        ).pipe(distinctUntilChanged());
        sZip$
            .pipe(
                filter((zip) => /^\d+$/.test(zip ?? "")),
                withLatestFrom(CostModel.collection$),
            )
            .subscribe(([zipcode, collection]) =>
                collection.modify((project) => {
                    (project.location as USLocation).zipcode = zipcode;
                }),
            );

        export const globalOrLocalZip$ = Location.location$.pipe(
            switchMap((location) => (location === undefined ? Model.Location.zip$ : Location.zip$)),
            distinctUntilChanged(),
            shareLatest(),
        );

        type ZipInfoResponse = {
            zip: number;
            ba: string;
            gea: string;
            state: string;
            padd: string;
            technobasin: string;
            reeds_ba: string;
        };

        export const zipInfo$ = globalOrLocalZip$.pipe(
            switchMap((zip) =>
                ajax<ZipInfoResponse[]>({
                    url: "/api/zip_info",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: {
                        zip: Number.parseInt(zip ?? "0"),
                    },
                }),
            ),
            map((response) => response.response[0]),
        );
    }

    /**
     * Customer sector streams
     */
    export const sSectorChange$ = new Subject<CustomerSector>();
    export const customerSector$ = merge(sSectorChange$, cost$.pipe(map((cost) => cost.customerSector))).pipe(
        guard(),
        distinctUntilChanged(),
    );
    sSectorChange$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([customerSector, costCollection]) => costCollection.modify({ customerSector }));

    /**
     * Fuel type streams
     */
    export const sFuelTypeChange$ = new Subject<FuelType>();
    export const fuelType$ = merge(sFuelTypeChange$, cost$.pipe(map((cost) => cost.fuelType))).pipe(
        distinctUntilChanged(),
    );
    sFuelTypeChange$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([fuelType, costCollection]) => {
        // Set fuel type
        costCollection.modify({ fuelType });

        // Coal can only be set with an industrial customer sector
        if (fuelType === FuelType.COAL) costCollection.modify({ customerSector: CustomerSector.INDUSTRIAL });
    });

    export const sectorOptions$ = fuelType$.pipe(
        map((fuelType) => {
            if (fuelType === FuelType.COAL) return [CustomerSector.INDUSTRIAL];

            return Object.values(CustomerSector);
        }),
        startWith(Object.values(CustomerSector)),
    );

    type EscalationRateResponse = {
        case: string;
        release_year: number;
        year: number;
        division: string;
        electricity: number;
        natural_gas: number;
        propane: number;
        region: string;
        residual_fuel_oil: number;
        distillate_fuel_oil: number;
        sector: string;
    };

    // Gets the default escalation rate information from the api
    export const fetchEscalationRates$ = combineLatest([
        Model.releaseYear$,
        Model.studyPeriod$,
        Location.globalOrLocalZip$,
        customerSector$,
        Model.case$,
    ]).pipe(
        tap((inputs) => console.log("Inputs: ", inputs)),
        switchMap(([releaseYear, studyPeriod, zip, sector, eiaCase]) =>
            ajax<EscalationRateResponse[]>({
                url: "/api/escalation_rates",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: {
                    release_year: releaseYear,
                    from: releaseYear,
                    to: releaseYear + (studyPeriod ?? 0),
                    zip: Number.parseInt(zip ?? "0"),
                    sector,
                    case: eiaCase,
                },
            }),
        ),
        map((response) => response.response),
        combineLatestWith(fuelType$),
        map(([response, fuelType]) =>
            response.map((value) =>
                match(fuelType)
                    .with(FuelType.ELECTRICITY, () => value.electricity)
                    .with(FuelType.PROPANE, () => value.propane)
                    .with(FuelType.DISTILLATE_OIL, () => value.distillate_fuel_oil)
                    .with(FuelType.RESIDUAL_OIL, () => value.residual_fuel_oil)
                    .with(FuelType.NATURAL_GAS, () => value.natural_gas)
                    .otherwise(() => 0),
            ),
        ),
        catchError(() => of([] as number[])),
        shareLatest(),
    );

    /**
     * Unit streams
     */
    export const sUnitChange$ = new Subject<Unit>();
    export const unit$ = merge(sUnitChange$, cost$.pipe(map((cost) => cost.unit))).pipe(
        distinctUntilChanged(),
        shareReplay(1),
    );
    export const [useUnit] = bind(unit$, EnergyUnit.KWH);
    sUnitChange$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([unit, costCollection]) => costCollection.modify({ unit }));

    const EiaCaseMap = {
        [Case.REF]: "REF",
        [Case.LOWZTC]: "LRC",
    };

    const RateMap = {
        [EmissionsRateType.AVERAGE]: "avg",
        [EmissionsRateType.LONG_RUN_MARGINAL]: "lrm",
    };

    export namespace Emissions {
        export const emissions$: Observable<number[] | undefined> = combineLatest([
            Location.zipInfo$,
            Model.releaseYear$,
            Model.studyPeriod$,
            Model.case$,
            Model.emissionsRateType$,
            Model.ghgDataSource$,
            fuelType$,
        ]).pipe(
            tap((x) => console.log("Combined values", x)),
            switchMap(([zipInfo, releaseYear, studyPeriod, eiaCase, rate, ghgDataSource, fuelType]) => {
                const common = {
                    from: releaseYear,
                    to: releaseYear + (studyPeriod ?? 0),
                    release_year: releaseYear,
                    case: EiaCaseMap[eiaCase],
                    rate: RateMap[rate],
                };

                const oil = () =>
                    ajax<number[]>({
                        ...ajaxDefault,
                        url: "/api/region_case_oil",
                        body: {
                            ...common,
                            padd: zipInfo.padd,
                        },
                    }).pipe(map((response) => response.response));

                return match(fuelType)
                    .with(FuelType.ELECTRICITY, () => {
                        console.log("Calling for region case", { ...common, ba: zipInfo.ba });

                        if (ghgDataSource === GhgDataSource.NIST_NETL) {
                            return ajax<number[]>({
                                ...ajaxDefault,
                                url: "/api/region_case_ba",
                                body: {
                                    ...common,
                                    ba: zipInfo.ba,
                                },
                            }).pipe(
                                tap((x) => console.log("ba response", x)),
                                map((response) => response.response),
                            );
                        }

                        return ajax<number[]>({
                            ...ajaxDefault,
                            url: "/api/region_case_reeds",
                            body: {
                                ...common,
                                padd: zipInfo.reeds_ba,
                            },
                        }).pipe(map((response) => response.response));
                    })
                    .with(FuelType.NATURAL_GAS, () =>
                        ajax<number[]>({
                            ...ajaxDefault,
                            url: "/api/region_natgas",
                            body: {
                                ...common,
                                technobasin: zipInfo.technobasin,
                            },
                        }).pipe(map((response) => response.response)),
                    )
                    .with(FuelType.DISTILLATE_OIL, oil)
                    .with(FuelType.RESIDUAL_OIL, oil)
                    .with(FuelType.PROPANE, () =>
                        ajax<number[]>({
                            ...ajaxDefault,
                            url: "/api/region_case_propane_lng",
                            body: {
                                ...common,
                                padd: zipInfo.padd,
                            },
                        }).pipe(map((response) => response.response)),
                    )
                    .with(FuelType.COAL, () => of(Array(studyPeriod).fill(COAL_KG_CO2_PER_MEGAJOULE)))
                    .otherwise(() => of(Array(studyPeriod).fill(0)));
            }),
            tap((result) => console.log(result)),
        );
        emissions$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([emissions, collection]) => {
            console.log(emissions);

            if (emissions === undefined) {
                collection.modify({
                    emissions: undefined,
                });
            } else {
                collection.modify({
                    emissions,
                });
            }
        });
    }
}
