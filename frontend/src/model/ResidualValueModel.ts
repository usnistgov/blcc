import { DollarOrPercent, type ResidualValueCost, type ResidualValue as ResidualValueType } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { type Observable, Subject, map } from "rxjs";
import { filter, withLatestFrom } from "rxjs/operators";

export namespace ResidualValueModel {
    export const hasResidualValue$ = CostModel.cost$.pipe(map((cost) => Object.hasOwn(cost, "residualValue")));
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
    const cost$: Observable<ResidualValueCost> = CostModel.cost$.pipe(
        // @ts-ignore
        filter((cost): cost is ResidualValueCost => Object.hasOwn(cost, "residualValue")),
    );
}
