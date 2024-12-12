import { bind } from "@react-rxjs/core";
import type { Cost } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { isRecurringCost } from "model/Guards";
import { Model, Var } from "model/Model";
import * as O from "optics-ts";
import { Subject, distinctUntilChanged, merge } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import { guard, isConstant } from "util/Operators";

export namespace RecurringModel {
    const recurringOptic = O.optic<Cost>().guard(isRecurringCost).prop("recurring");

    export const recurring = new Var(CostModel.DexieCostModel, recurringOptic);

    export const [isRecurring] = bind(recurring.$.pipe(map((recurring) => !!recurring)));

    export const rateOfChangeValue = new Var(
        CostModel.DexieCostModel,
        recurringOptic.optional().prop("rateOfChangeValue"),
    );

    export const [isValueRateOfChangeConstant] = bind(rateOfChangeValue.$.pipe(guard(), isConstant()));

    export const rateOfChangeUnits = new Var(
        CostModel.DexieCostModel,
        recurringOptic.optional().prop("rateOfChangeUnits"),
    );

    export const [isUnitRateOfChangeConstant] = bind(rateOfChangeUnits.$.pipe(guard(), isConstant()));

    export const sRateOfChangeValue$ = new Subject<number | number[]>();
    export const rateOfChangeValue$ = merge(
        sRateOfChangeValue$,
        recurring.$.pipe(map((recurring) => recurring?.rateOfChangeValue ?? 0)),
    ).pipe(distinctUntilChanged());
    sRateOfChangeValue$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([rateOfChangeValue, collection]) =>
            collection.modify({ "recurring.rateOfChangeValue": rateOfChangeValue }),
        );

    export const sIsValueChangeConstant$ = new Subject<boolean>();
    export const isValueChangeConstant$ = merge(
        sIsValueChangeConstant$,
        recurring.$.pipe(map((recurring) => !Array.isArray(recurring?.rateOfChangeValue))),
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
        recurring.$.pipe(map((recurring) => recurring?.rateOfChangeUnits ?? 0)),
    ).pipe(distinctUntilChanged());
    sRateOfChangeUnits$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([rateOfChangeUnits, collection]) =>
            collection.modify({ "recurring.rateOfChangeUnits": rateOfChangeUnits }),
        );

    export const sIsUnitChangeConstant$ = new Subject<boolean>();
    export const isUnitChangeConstant$ = merge(
        sIsUnitChangeConstant$,
        recurring.$.pipe(map((recurring) => !Array.isArray(recurring?.rateOfChangeUnits))),
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
