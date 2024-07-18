import { mdiMenuDown } from "@mdi/js";
import Icon from "@mdi/react";
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
import YearDisplay from "components/YearDisplay";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { useSubscribe } from "hooks/UseSubscribe";
import { CostModel } from "model/CostModel";
import { Model } from "model/Model";
import { useMemo } from "react";
import { EMPTY, type Observable, Subject, combineLatest, distinctUntilChanged, merge } from "rxjs";
import { map, tap, withLatestFrom } from "rxjs/operators";
import { P, match } from "ts-pattern";
import constructionPeriod$ = Model.constructionPeriod$;

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
    const [
        sToggle$,
        isRecurring$,
        sRateOfRecurrence$,
        rateOfRecurrence$,
        rateOfChangeValue$,
        rateOfChangeUnits$,
        indicators$,
    ] = useMemo(() => {
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

        const indicators$ = state(
            combineLatest([rateOfRecurrence$, Model.studyPeriod$, Model.constructionPeriod$]).pipe(
                map(([rateOfRecurrence, studyPeriod, constructionPeriod]) => {
                    return Array.from(Array((studyPeriod ?? 0) + constructionPeriod)).map((_, i) => {
                        if (i < constructionPeriod || (i - constructionPeriod) % rateOfRecurrence !== 0)
                            return <div key={i} className={"table-cell"} />;

                        return (
                            <div key={i} className={"table-cell"}>
                                <Icon size={0.6} path={mdiMenuDown} />
                            </div>
                        );
                    });
                }),
            ),
            [],
        );

        return [
            sToggle$,
            isRecurring$,
            sRateOfRecurrence$,
            rateOfRecurrence$,
            rateOfChangeValue$,
            rateOfChangeUnits$,
            indicators$,
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
    const indicators = useStateObservable(indicators$);

    return (
        <div className={"flex flex-col w-full"}>
            <Title level={5}>Recurring</Title>
            <span>
                <Switch checkedChildren={"Yes"} unCheckedChildren={"No"} value$={isRecurring$} wire={sToggle$} />
            </span>
            {isRecurring && (
                <>
                    <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
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
                    </div>

                    <YearDisplay above={indicators} />
                </>
            )}
        </div>
    );
}
