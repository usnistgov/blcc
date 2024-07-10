import { bind, shareLatest, state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { CostTypes, type CustomerSector, type EnergyCost, EnergyUnit, FuelType, type Unit } from "blcc-format/Format";
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
    combineLatest([sSectorChange$, CostModel.collection$]).subscribe(([customerSector, costCollection]) =>
        costCollection.modify({ customerSector }),
    );

    /**
     * Fuel type streams
     */
    export const sFuelTypeChange$ = new Subject<FuelType>();
    export const fuelType$ = merge(sFuelTypeChange$, cost$.pipe(map((cost) => cost.fuelType))).pipe(
        distinctUntilChanged(),
    );
    combineLatest([sFuelTypeChange$, CostModel.collection$]).subscribe(([fuelType, costCollection]) =>
        costCollection.modify({ fuelType }),
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

    Model.releaseYear$.subscribe((x) => console.log("Release year changed", x));
    Model.studyPeriod$.subscribe((x) => console.log("study period changed", x));
    Model.Location.zip$.subscribe((x) => console.log("zip changed", x));
    customerSector$.subscribe((x) => console.log("customer sector changed", x));

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
     * Use index streams
     */
    export const [useIndexChange$, useIndexChange] = createSignal<number | number[]>();
    const newUseIndex$ = useIndexChange$.pipe(shareReplay(1));
    export const useIndex$ = merge(newUseIndex$, cost$.pipe(map((cost) => cost.useIndex))).pipe(
        distinctUntilChanged(),
        shareReplay(1),
    );
    combineLatest([newUseIndex$, CostModel.collection$]).subscribe(([newRates, costCollection]) =>
        costCollection.modify({ useIndex: newRates }),
    );

    useIndex$.subscribe((x) => console.log("Use Index", x));

    /**
     * Unit streams
     */
    export const sUnitChange$ = new Subject<Unit>();
    export const unit$ = merge(sUnitChange$, cost$.pipe(map((cost) => cost.unit))).pipe(
        distinctUntilChanged(),
        shareReplay(1),
    );
    export const [useUnit] = bind(unit$, EnergyUnit.KWH);
    combineLatest([sUnitChange$, CostModel.collection$]).subscribe(([unit, costCollection]) =>
        costCollection.modify({ unit }),
    );
}
