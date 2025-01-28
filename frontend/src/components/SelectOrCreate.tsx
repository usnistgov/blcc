import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { type StateObservable, state, useStateObservable } from "@react-rxjs/core";
import { Select, type SelectProps } from "antd";
import { useSubscribe } from "hooks/UseSubscribe";
import type * as React from "react";
import { useMemo } from "react";
import { BehaviorSubject, type Observable, Subject, combineLatest } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";

type SelectOrCreateProps<T> = {
    value$: StateObservable<T | undefined>;
    wire$: Subject<T>;
    options$: Observable<OptionType[]>;
};

export type OptionType = {
    label: React.ReactNode;
    value: string;
    identifier?: symbol;
};
const CREATE_SYMBOL = Symbol("create new unit");

export default function SelectOrCreate({
    value$,
    wire$,
    options$,
    ...selectProps
}: SelectOrCreateProps<string> & SelectProps<string, OptionType>) {
    const [sSearch$, totalOptions$, sOnChange$, output$] = useMemo(() => {
        const sSearch$ = new BehaviorSubject<string>("");
        const totalOptions$ = state(
            combineLatest([sSearch$, options$]).pipe(
                map(([query, options]) => {
                    if (query === undefined || query === "") return options;

                    return [
                        ...((options as OptionType[]) ?? []),
                        {
                            identifier: CREATE_SYMBOL,
                            value: "Create New Unit",
                            label: (
                                <div className={"flex items-center gap-1"}>
                                    <Icon className={"align-middle"} path={mdiPlus} size={0.8} />
                                    <p>Create New Unit</p>
                                </div>
                            ),
                        },
                    ];
                }),
            ),
            [],
        );

        const sOnChange$ = new Subject<OptionType>();
        const output$ = sOnChange$.pipe(
            withLatestFrom(sSearch$),
            map(([{ identifier, value }, newUnit]) => (identifier === CREATE_SYMBOL ? newUnit : value)),
        );

        return [sSearch$, totalOptions$, sOnChange$, output$];
    }, [options$]);

    const optionWithDefault = useStateObservable(totalOptions$);
    const value = useStateObservable(value$);

    useSubscribe(output$, wire$);

    return (
        <Select
            className={"min-w-[75px]"}
            showSearch
            popupMatchSelectWidth={false}
            filterOption={(input, option) => {
                if (option === undefined) return false;
                if (option.identifier === CREATE_SYMBOL) return true;

                return option.value.toLowerCase().includes(input.toLowerCase());
            }}
            options={optionWithDefault}
            value={value}
            onSearch={(query) => sSearch$.next(query)}
            onChange={(_, option) => {
                if (Array.isArray(option)) return;
                if (option !== undefined) sOnChange$.next(option);
            }}
            {...selectProps}
        />
    );
}
