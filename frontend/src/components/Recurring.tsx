import { mdiMenuDown } from "@mdi/js";
import Icon from "@mdi/react";
import { bind, shareLatest, state, useStateObservable } from "@react-rxjs/core";
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
import { combineLatestWith, map, tap, withLatestFrom } from "rxjs/operators";
import { P, match } from "ts-pattern";
import constructionPeriod$ = Model.constructionPeriod$;
import DataGrid from "react-data-grid";
import { RecurringModel } from "../model/RecurringModel";

type RecurringCost = OMRCost | RecurringContractCost | OtherCost | OtherNonMonetary;

const VALUE_COLUMNS = [
    {
        name: "Year",
        key: "year",
    },
    {
        name: "Value Rate of Change",
        key: "rateOfChangeValue",
        editable: true,
    },
];

const UNIT_COLUMNS = [
    {
        name: "Year",
        key: "year",
    },
    {
        name: "Unit Rate of Change",
        key: "rateOfChangeUnits",
        editable: true,
    },
];

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
        useRateOfChangeValue,
        useRateOfChangeUnits,
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
        const [useRateOfChangeValue, rateOfChangeValue$] = bind(
            recurring$.pipe(
                map((recurring) => recurring.rateOfChangeValue),
                combineLatestWith(Model.releaseYear$),
                map(([change, releaseYear]) =>
                    match(change)
                        .with(P.array(), (changes) =>
                            changes.map((rate, i) => ({
                                year: releaseYear + i,
                                rateOfChangeValue: rate,
                            })),
                        )
                        .otherwise((constant) => constant),
                ),
            ),
            [],
        );
        const [useRateOfChangeUnits, rateOfChangeUnits$] = bind(
            recurring$.pipe(
                map((recurring) => recurring.rateOfChangeUnits),
                combineLatestWith(Model.releaseYear$),
                map(([change, releaseYear]) =>
                    match(change)
                        .with(P.array(), (changes) =>
                            changes.map((rate, i) => ({
                                year: releaseYear + i,
                                rateOfChangeUnits: rate,
                            })),
                        )
                        .otherwise((constant) => constant),
                ),
            ),
            [],
        );

        const indicators$ = state(
            combineLatest([rateOfRecurrence$, Model.studyPeriod$, Model.constructionPeriod$]).pipe(
                map(([rateOfRecurrence, studyPeriod, constructionPeriod]) => {
                    return Array.from(Array((studyPeriod ?? 0) + constructionPeriod)).map((_, i) => {
                        if (i < constructionPeriod || (i - constructionPeriod) % rateOfRecurrence !== 0)
                            return <div key={i} />;

                        return <Icon key={i} size={0.6} path={mdiMenuDown} />;
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
            useRateOfChangeValue,
            useRateOfChangeUnits,
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
    const rateOfChangeValue = useRateOfChangeValue();
    const rateOfChangeUnits = useRateOfChangeUnits();

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

                    <div className={"mb-4"}>
                        <YearDisplay above={indicators} />
                    </div>

                    <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                        <div>
                            <Title level={5}>Value Rate of Change</Title>
                            <span className={"flex flex-row items-center gap-2 pb-2"}>
                                <p className={"text-md pb-1"}>Constant</p>
                                <Switch
                                    value$={RecurringModel.isValueChangeConstant$}
                                    wire={RecurringModel.sIsValueChangeConstant$}
                                    checkedChildren={"Yes"}
                                    unCheckedChildren={"No"}
                                />
                            </span>
                            {match(rateOfChangeValue)
                                .with(P.array(), (rateOfChangeValue) => (
                                    <div className={"w-full overflow-hidden rounded shadow-lg"}>
                                        <DataGrid columns={VALUE_COLUMNS} rows={rateOfChangeValue} />
                                    </div>
                                ))
                                .otherwise(() => (
                                    <div>
                                        <NumberInput
                                            className={"w-full"}
                                            label={"Constant Value Change"}
                                            showLabel={false}
                                            value$={EMPTY}
                                            wire={new Subject<number>()}
                                            addonAfter={"%"}
                                        />
                                    </div>
                                ))}
                        </div>
                        <div>
                            <Title level={5}>Unit Rate of Change</Title>
                            <span className={"flex flex-row items-center gap-2 pb-2"}>
                                <p className={"text-md pb-1"}>Constant</p>
                                <Switch
                                    value$={EMPTY}
                                    wire={new Subject<boolean>()}
                                    checkedChildren={"Yes"}
                                    unCheckedChildren={"No"}
                                />
                            </span>
                            {match(rateOfChangeUnits)
                                .with(P.array(), (rateOfChangeUnits) => (
                                    <DataGrid columns={UNIT_COLUMNS} rows={rateOfChangeUnits} />
                                ))
                                .otherwise(() => (
                                    <div>
                                        <NumberInput
                                            className={"w-full"}
                                            label={"Constant Unit Change"}
                                            showLabel={false}
                                            value$={EMPTY}
                                            wire={new Subject<number>()}
                                            addonAfter={"%"}
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
