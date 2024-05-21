import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Subject, combineLatest, distinctUntilChanged, map, merge, of, switchMap } from "rxjs";
import { ajax } from "rxjs/internal/ajax/ajax";
import { catchError, combineLatestWith, filter, shareReplay } from "rxjs/operators";
import { match } from "ts-pattern";
import {
    CostTypes,
    type CustomerSector,
    type EnergyCost,
    EnergyUnit,
    FuelType,
    type Unit,
} from "../../blcc-format/Format";
import { guard } from "../../util/Operators";
import { CostModel } from "../CostModel";
import { releaseYear$, studyPeriod$, zip$ } from "../Model";

/**
 * Outputs a value if the current cost is an energy cost
 */
export const energyCost$ = CostModel.cost$.pipe(filter((cost): cost is EnergyCost => cost.type === CostTypes.ENERGY));

/**
 * Customer sector streams
 */
export const sSectorChange$ = new Subject<CustomerSector>();
export const customerSector$ = merge(sSectorChange$, energyCost$.pipe(map((cost) => cost.customerSector))).pipe(
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
export const fuelType$ = merge(sFuelTypeChange$, energyCost$.pipe(map((cost) => cost.fuelType))).pipe(
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
// Gets the default escalation rate information from the api
export const fetchEscalationRates$ = combineLatest([releaseYear$, studyPeriod$, zip$, customerSector$]).pipe(
    switchMap(([releaseYear, studyPeriod, zip, sector]) =>
        ajax<EscalationRateResponse[]>({
            url: "/api/escalation-rates",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: {
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
);
export const [rateChange$, rateChange] = createSignal<number | number[]>();
export const escalation$ = merge(
    rateChange$,
    energyCost$.pipe(switchMap((cost) => (cost.escalation ? of(cost.escalation) : fetchEscalationRates$))),
).pipe(distinctUntilChanged());
combineLatest([rateChange$, CostModel.collection$]).subscribe(([newRates, costCollection]) =>
    costCollection.modify({ escalation: newRates }),
);

/**
 * Use index streams
 */
export const [useIndexChange$, useIndexChange] = createSignal<number | number[]>();
const newUseIndex$ = useIndexChange$.pipe(shareReplay(1));
export const useIndex$ = merge(newUseIndex$, energyCost$.pipe(map((cost) => cost.useIndex))).pipe(
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
export const unit$ = merge(sUnitChange$, energyCost$.pipe(map((cost) => cost.unit))).pipe(
    distinctUntilChanged(),
    shareReplay(1),
);
export const [useUnit] = bind(unit$, EnergyUnit.KWH);
combineLatest([sUnitChange$, CostModel.collection$]).subscribe(([unit, costCollection]) =>
    costCollection.modify({ unit }),
);
