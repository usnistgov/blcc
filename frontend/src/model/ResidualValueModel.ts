import { state } from "@react-rxjs/core";
import { DollarOrPercent, type ResidualValueCost, type ResidualValue as ResidualValueType } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { type Observable, Subject, distinctUntilChanged, map, merge } from "rxjs";
import { filter, withLatestFrom } from "rxjs/operators";

export namespace ResidualValueModel {
    export const hasResidualValue$ = state(
        // @ts-ignore
        CostModel.cost.$.pipe(map((cost) => Object.hasOwn(cost, "residualValue"))),
        false,
    );
    export const sSetResidualValue$ = new Subject<boolean>();
    sSetResidualValue$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([hasResidualValue, collection]) => {
        collection.modify({
            residualValue: hasResidualValue
                ? ({
                      approach: DollarOrPercent.DOLLAR,
                      value: 0,
                  } as ResidualValueType)
                : undefined,
        });
    });

    // @ts-ignore
    const cost$: Observable<ResidualValueCost> = CostModel.cost.$.pipe(
        // @ts-ignore
        filter((cost): cost is ResidualValueCost => Object.hasOwn(cost, "residualValue")),
    );

    export const sApproach$ = new Subject<DollarOrPercent>();
    export const approach$ = state(
        merge(cost$.pipe(map((cost) => cost.residualValue?.approach)), sApproach$).pipe(distinctUntilChanged()),
        DollarOrPercent.DOLLAR,
    );
    sApproach$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([approach, collection]) => collection.modify({ "residualValue.approach": approach }));

    export const sValue$ = new Subject<number | undefined>();
    export const value$ = state(
        merge(sValue$, cost$.pipe(map((cost) => cost.residualValue?.value ?? 0))).pipe(distinctUntilChanged()),
        0,
    );
    sValue$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([value, collection]) => collection.modify({ "residualValue.value": value }));
}
