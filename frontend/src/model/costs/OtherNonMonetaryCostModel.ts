import { state } from "@react-rxjs/core";
import { CostTypes, EnergyUnit, type OtherNonMonetary, type Unit } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { Subject, distinctUntilChanged, merge } from "rxjs";
import { filter, map, withLatestFrom } from "rxjs/operators";

export namespace OtherNonMonetaryCostModel {
    /**
     * The cost stream narrowed to an OtherCost
     */
    export const cost$ = CostModel.cost$.pipe(
        filter((cost): cost is OtherNonMonetary => cost.type === CostTypes.OTHER_NON_MONETARY),
    );

    /**
     * The tags for the current other cost
     */
    export const sTags$ = new Subject<string[]>();
    export const tags$ = state(merge(sTags$, cost$.pipe(map((cost) => cost.tags))).pipe(distinctUntilChanged()), []);
    sTags$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([tags, collection]) => collection.modify({ tags }));

    export const sInitialOccurrence$ = new Subject<number>();
    export const initialOccurrence$ = state(
        merge(sInitialOccurrence$, cost$.pipe(map((cost) => cost.initialOccurrence))).pipe(distinctUntilChanged()),
        0,
    );
    sInitialOccurrence$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([initialOccurrence, collection]) => collection.modify({ initialOccurrence }));

    export const sUnit$ = new Subject<string | Unit>();
    export const unit$ = state(
        merge(sUnit$, cost$.pipe(map((cost) => cost.unit))).pipe(distinctUntilChanged()),
        EnergyUnit.KWH,
    );
    sUnit$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([unit, collection]) => collection.modify({ unit }));

    export const sNumberOfUnits$ = new Subject<number>();
    export const numberOfUnits$ = state(
        merge(sNumberOfUnits$, cost$.pipe(map((cost) => cost.numberOfUnits))).pipe(distinctUntilChanged()),
        0,
    );
    sNumberOfUnits$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([numberOfUnits, collection]) => collection.modify({ numberOfUnits }));
}
