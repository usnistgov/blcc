import { shareLatest, state, useStateObservable } from "@react-rxjs/core";
import Title from "antd/es/typography/Title";
import {
    type Cost,
    CostTypes,
    type OMRCost,
    type OtherCost,
    type OtherNonMonetary,
    type RecurringContractCost,
    type Recurring as RecurringType,
} from "blcc-format/Format";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { useSubscribe } from "hooks/UseSubscribe";
import { CostModel } from "model/CostModel";
import { useMemo } from "react";
import { EMPTY, type Observable, Subject, distinctUntilChanged, merge } from "rxjs";
import { map, tap, withLatestFrom } from "rxjs/operators";
import { P, match } from "ts-pattern";

type RecurringCost = OMRCost | RecurringContractCost | OtherCost | OtherNonMonetary;

function recurringPredicate(cost: Cost) {
    return match(cost)
        .with(
            {
                type: P.union(
                    CostTypes.OMR,
                    CostTypes.RECURRING_CONTRACT,
                    CostTypes.OTHER,
                    CostTypes.OTHER_NON_MONETARY,
                ),
            },
            (cost) => cost.recurring !== undefined,
        )
        .otherwise(() => false);
}

export default function Recurring() {
    const [sToggle$, isRecurring$, sRateOfRecurrence$, rateOfRecurrence$, rateOfChangeValue$, rateOfChangeUnits$] =
        useMemo(() => {
            const sToggle$ = new Subject<boolean>();
            const isRecurring$ = state(
                merge(sToggle$, CostModel.cost$.pipe(map(recurringPredicate))).pipe(distinctUntilChanged()),
                false,
            );

            const recurring$: Observable<RecurringType> = CostModel.cost$.pipe(
                map((cost) => (cost as RecurringCost).recurring ?? {}),
                shareLatest(),
            );

            const sRateOfRecurrence$ = new Subject<number>();
            const rateOfRecurrence$ = state(
                merge(sRateOfRecurrence$, recurring$.pipe(map((recurring) => recurring.rateOfRecurrence ?? 0))).pipe(
                    distinctUntilChanged(),
                ),
                0,
            );
            const rateOfChangeValue$ = recurring$.pipe(map((recurring) => recurring.rateOfChangeValue));
            const rateOfChangeUnits$ = recurring$.pipe(map((recurring) => recurring.rateOfChangeUnits));

            return [
                sToggle$,
                isRecurring$,
                sRateOfRecurrence$,
                rateOfRecurrence$,
                rateOfChangeValue$,
                rateOfChangeUnits$,
            ];
        }, []);

    useSubscribe(sRateOfRecurrence$.pipe(withLatestFrom(CostModel.collection$)), ([rateOfRecurrence, collection]) =>
        collection.modify({ "recurring.rateOfRecurrence": rateOfRecurrence }),
    );
    useSubscribe(sToggle$.pipe(withLatestFrom(CostModel.collection$)), ([recurring, collection]) => {
        if (!recurring) collection.modify({ recurring: undefined });
        else collection.modify({ recurring: { rateOfRecurrence: 0 } });
    });

    const isRecurring = useStateObservable(isRecurring$);

    return (
        <div className={"flex flex-col"}>
            <Title level={5}>Recurring</Title>
            <span>
                <Switch checkedChildren={"Yes"} unCheckedChildren={"No"} value$={isRecurring$} wire={sToggle$} />
            </span>
            {isRecurring && (
                <NumberInput
                    label={"Rate of Recurrence"}
                    allowEmpty={false}
                    showLabel={false}
                    className={"my-4 w-full"}
                    addonBefore={"occurs every"}
                    addonAfter={"years"}
                    value$={rateOfRecurrence$}
                    wire={sRateOfRecurrence$}
                />
            )}
        </div>
    );
}
