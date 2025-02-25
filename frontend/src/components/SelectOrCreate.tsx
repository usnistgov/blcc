import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { bind, shareLatest } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Select, type SelectProps } from "antd";
import { useSubscribe } from "hooks/UseSubscribe";
import { OtherCostModel } from "model/costs/OtherCostModel";
import type * as React from "react";
import { combineLatest } from "rxjs";
import { map, startWith, withLatestFrom } from "rxjs/operators";

export type OptionType = {
    label: React.ReactNode;
    value: string;
    identifier?: symbol;
};

const CREATE_SYMBOL = Symbol("create new unit");
const CREATE_OPTION = {
    identifier: CREATE_SYMBOL,
    value: "Create New Unit",
    label: (
        <div className={"flex items-center gap-1"}>
            <Icon className={"align-middle"} path={mdiPlus} size={0.8} />
            <p>Create New Unit</p>
        </div>
    ),
};

namespace Model {
    export const [search$, search] = createSignal<string>();
    const defaultedSearch$ = search$.pipe(startWith(undefined), shareLatest());

    export const [change$, change] = createSignal<OptionType>();
    export const [useOptionsWithDefault] = bind(
        combineLatest([defaultedSearch$, OtherCostModel.allUnits$]).pipe(
            map(([query, options]) => {
                if (query === undefined || query === "") return options;

                return [...options, CREATE_OPTION];
            }),
        ),
        [],
    );

    export const output$ = Model.change$.pipe(
        withLatestFrom(defaultedSearch$),
        map(([{ identifier, value }, newUnit]) => (identifier === CREATE_SYMBOL ? newUnit : value)),
    );
}

export default function SelectOrCreate({ ...selectProps }: SelectProps<string, OptionType>) {
    useSubscribe(Model.output$, (unit) => OtherCostModel.unit.set(unit));

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
            options={Model.useOptionsWithDefault()}
            value={OtherCostModel.unit.use()}
            onSearch={Model.search}
            onChange={(_, option) => {
                if (Array.isArray(option)) return;
                if (option !== undefined) Model.change(option);
            }}
            {...selectProps}
        />
    );
}
