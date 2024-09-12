import { bind, shareLatest, state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import {
    CostTypes,
    type CustomerSector,
    type EnergyCost,
    EnergyUnit,
    FuelType,
    type NonUSLocation,
    type USLocation,
    type Unit,
} from "blcc-format/Format";
import { Country, type State } from "constants/LOCATION";
import { CostModel } from "model/CostModel";
import { Model } from "model/Model";
import { Subject, combineLatest, distinctUntilChanged, map, merge, of, switchMap } from "rxjs";
import { ajax } from "rxjs/internal/ajax/ajax";
import { catchError, combineLatestWith, filter, shareReplay, withLatestFrom } from "rxjs/operators";
import { match } from "ts-pattern";
import { guard } from "util/Operators";

export namespace EnergyCostModel {
    /**
     * Outputs a value if the current cost is an energy cost
     */
    export const cost$ = CostModel.cost$.pipe(filter((cost): cost is EnergyCost => cost.type === CostTypes.ENERGY));

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
    sFuelTypeChange$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([fuelType, costCollection]) => costCollection.modify({ fuelType }));

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
        Model.Location.zip$,
        customerSector$,
    ]).pipe(
        switchMap(([releaseYear, studyPeriod, zip, sector]) =>
            ajax<EscalationRateResponse[]>({
                url: "/api/escalation-rates",
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
                    case: "ref", // FIXME can the user change this?
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
    export const [rateChange$, rateChange] = createSignal<number | number[]>();
    export const escalation$ = state(
        merge(rateChange$, cost$.pipe(map((cost) => cost.escalation))).pipe(distinctUntilChanged()),
        0,
    );
    rateChange$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([escalation, collection]) => collection.modify({ escalation }));

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
    }
}
