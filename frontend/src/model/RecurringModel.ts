import {
    CostTypes,
    type OMRCost,
    type OtherCost,
    type OtherNonMonetary,
    type RecurringContractCost,
} from "blcc-format/Format";
import { Subject, distinctUntilChanged, merge } from "rxjs";
import { filter, map, withLatestFrom } from "rxjs/operators";
import { guard } from "../util/Operators";
import { CostModel } from "./CostModel";
import { Model } from "./Model";

type RecurringTypes = RecurringContractCost | OtherCost | OtherNonMonetary | OMRCost;

export namespace RecurringModel {
    export const recurring$ = CostModel.cost$.pipe(
        filter(
            (cost): cost is RecurringTypes =>
                cost.type === CostTypes.OMR ||
                cost.type === CostTypes.RECURRING_CONTRACT ||
                cost.type === CostTypes.OTHER ||
                cost.type === CostTypes.OTHER_NON_MONETARY,
        ),
        map((cost) => cost.recurring),
        guard(),
    );

    export const sIsValueChangeConstant$ = new Subject<boolean>();
    export const isValueChangeConstant$ = merge(
        sIsValueChangeConstant$,
        recurring$.pipe(map((recurring) => Array.isArray(recurring?.rateOfChangeValue))),
    ).pipe(distinctUntilChanged());
    sIsValueChangeConstant$
        .pipe(withLatestFrom(CostModel.collection$, Model.studyPeriod$, Model.constructionPeriod$))
        .subscribe(([isConstant, collection]) =>
            collection.modify({
                "recurring.rateOfChangeValue": isConstant ? 0 : [],
            }),
        );
}
