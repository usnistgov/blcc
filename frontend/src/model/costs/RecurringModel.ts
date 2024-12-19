import {
    CostTypes,
    type OMRCost,
    type OtherCost,
    type OtherNonMonetary,
    type RecurringContractCost,
} from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { Model } from "model/Model";
import { Subject, distinctUntilChanged, merge } from "rxjs";
import { filter, map, withLatestFrom } from "rxjs/operators";
import { guard } from "util/Operators";

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

    export const sRateOfChangeValue$ = new Subject<number | number[]>();
    export const rateOfChangeValue$ = merge(
        sRateOfChangeValue$,
        recurring$.pipe(map((recurring) => recurring?.rateOfChangeValue ?? 0)),
    ).pipe(distinctUntilChanged());
    sRateOfChangeValue$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([rateOfChangeValue, collection]) =>
            collection.modify({ "recurring.rateOfChangeValue": rateOfChangeValue }),
        );

    export const sIsValueChangeConstant$ = new Subject<boolean>();
    export const isValueChangeConstant$ = merge(
        sIsValueChangeConstant$,
        recurring$.pipe(map((recurring) => !Array.isArray(recurring?.rateOfChangeValue))),
    ).pipe(distinctUntilChanged());
    sIsValueChangeConstant$
        .pipe(withLatestFrom(CostModel.collection$, Model.studyPeriod.$, Model.constructionPeriod.$))
        .subscribe(([isConstant, collection, studyPeriod, constructionPeriod]) =>
            collection.modify({
                "recurring.rateOfChangeValue": isConstant
                    ? 0
                    : Array.from(Array((studyPeriod ?? 0) + constructionPeriod)).fill(0),
            }),
        );

    export const sRateOfChangeUnits$ = new Subject<number | number[]>();
    export const rateOfChangeUnits$ = merge(
        sRateOfChangeUnits$,
        recurring$.pipe(map((recurring) => recurring?.rateOfChangeUnits ?? 0)),
    ).pipe(distinctUntilChanged());
    sRateOfChangeUnits$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([rateOfChangeUnits, collection]) =>
            collection.modify({ "recurring.rateOfChangeUnits": rateOfChangeUnits }),
        );

    export const sIsUnitChangeConstant$ = new Subject<boolean>();
    export const isUnitChangeConstant$ = merge(
        sIsUnitChangeConstant$,
        recurring$.pipe(map((recurring) => !Array.isArray(recurring?.rateOfChangeUnits))),
    ).pipe(distinctUntilChanged());
    sIsUnitChangeConstant$
        .pipe(withLatestFrom(CostModel.collection$, Model.studyPeriod.$, Model.constructionPeriod.$))
        .subscribe(([isConstant, collection, studyPeriod, constructionPeriod]) =>
            collection.modify({
                "recurring.rateOfChangeUnits": isConstant
                    ? 0
                    : Array.from(Array((studyPeriod ?? 0) + constructionPeriod)).fill(0),
            }),
        );
}
