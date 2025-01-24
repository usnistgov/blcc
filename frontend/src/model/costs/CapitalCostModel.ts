import { type CapitalCost, CostTypes } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { type Observable, Subject, distinctUntilChanged, map, merge } from "rxjs";
import { filter, withLatestFrom } from "rxjs/operators";
import cost = CostModel.cost;
import type { Collection } from "dexie";

export namespace CapitalCostModel {
    export const cost$ = cost.$.pipe(filter((cost): cost is CapitalCost => cost.type === CostTypes.CAPITAL));
    const collection$ = CostModel.collection$ as Observable<Collection<CapitalCost>>;

    export const sInitialCost$ = new Subject<number | undefined>();
    export const initialCost$ = merge(sInitialCost$, cost$.pipe(map((cost) => cost.initialCost))).pipe(
        distinctUntilChanged(),
    );
    sInitialCost$
        .pipe(withLatestFrom(collection$))
        .subscribe(([initialCost, collection]) => collection.modify({ initialCost }));

    export const sAnnualRateOfChange$ = new Subject<number | undefined>();
    export const annualRateOfChange$ = merge(
        sAnnualRateOfChange$,
        cost$.pipe(map((cost) => cost.annualRateOfChange)),
    ).pipe(distinctUntilChanged());
    sAnnualRateOfChange$
        .pipe(withLatestFrom(collection$))
        .subscribe(([annualRateOfChange, collection]) => collection.modify({ annualRateOfChange }));

    export const sExpectedLifetime$ = new Subject<number | undefined>();
    export const expectedLifetime$ = merge(sExpectedLifetime$, cost$.pipe(map((cost) => cost.expectedLife))).pipe(
        distinctUntilChanged(),
    );
    sExpectedLifetime$
        .pipe(withLatestFrom(collection$))
        .subscribe(([expectedLife, collection]) => collection.modify({ expectedLife }));

    export const sCostAdjustmentFactor$ = new Subject<number | undefined>();
    export const costAdjustmentFactor$ = merge(
        sCostAdjustmentFactor$,
        cost$.pipe(map((cost) => cost.costAdjustment)),
    ).pipe(distinctUntilChanged());
    sCostAdjustmentFactor$
        .pipe(withLatestFrom(collection$))
        .subscribe(([costAdjustment, collection]) => collection.modify({ costAdjustment }));

    export const sAmountFinanced$ = new Subject<number | undefined>();
    export const amountFinanced$ = merge(sAmountFinanced$, cost$.pipe(map((cost) => cost.amountFinanced))).pipe(
        distinctUntilChanged(),
    );
    amountFinanced$
        .pipe(withLatestFrom(collection$))
        .subscribe(([amountFinanced, collection]) => collection.modify({ amountFinanced }));

    export const sPhaseInChange$ = new Subject<number[]>();
    export const phaseIn$ = merge(sPhaseInChange$, cost$.pipe(map((cost) => cost.phaseIn))).pipe(
        distinctUntilChanged(),
    );
    sPhaseInChange$
        .pipe(withLatestFrom(collection$))
        .subscribe(([phaseIn, collection]) => collection.modify({ phaseIn }));
}
