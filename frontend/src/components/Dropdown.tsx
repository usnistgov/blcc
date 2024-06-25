import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Select, type SelectProps } from "antd";
import Title from "antd/es/typography/Title";
import { type Key, type PropsWithChildren, useEffect, useMemo } from "react";
import { type Observable, type Subject, of } from "rxjs";

type DropdownProps<T extends Key> = {
    className?: string;
    label?: string;
    options: Observable<T[]> | T[];
    value$?: Observable<T | undefined>;
    wire: Subject<T>;
};

export function Dropdown<T extends Key>({
    label,
    children,
    options,
    value$,
    wire,
    ...selectProps
}: PropsWithChildren<DropdownProps<T>> & Omit<SelectProps, "onChange" | "value" | "options">) {
    const { change$, change, useValue, useOptions } = useMemo(() => {
        const [change$, change] = createSignal<T>();
        const [useValue] = bind(value$ ? value$ : wire, undefined);

        const [useOptions] = bind(Array.isArray(options) ? of(options) : options, []);

        return { change$, change, useValue, useOptions };
    }, [value$, options, wire]);

    useEffect(() => {
        const sub = change$.subscribe(wire);
        return () => sub.unsubscribe();
    }, [wire, change$]);

    const select = (
        <Select onChange={(value) => change(value)} value={useValue()} {...selectProps}>
            {children}
            {useOptions().map((option) => (
                <Select.Option key={option} value={option}>
                    {option.toString()}
                </Select.Option>
            ))}
        </Select>
    );

    return (
        (label !== undefined && (
            <div>
                <Title level={5}>{label}</Title>
                {select}
            </div>
        )) ||
        select
    );
}
