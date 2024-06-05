import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Select, type SelectProps, Typography } from "antd";
import { type Key, type PropsWithChildren, useEffect, useMemo } from "react";
import { EMPTY, type Observable, type Subject, of } from "rxjs";

export type DropdownProps = {
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    showSearch?: boolean;
    value?: string;
    label?: string;
};

export type Dropdown<T> = {
    change$: Observable<T>;
    selectSearch$: Observable<T>;
    component: React.FC<PropsWithChildren & DropdownProps>;
};

const { Title } = Typography;

/**
 * Creates a dropdown component and its associated change stream.
 */
export default function dropdown<T extends string | number>(
    options$: Observable<T[]> | T[],
    value$: Observable<T | undefined> = EMPTY,
): Dropdown<T> {
    const [change$, change] = createSignal<T>();
    const [selectSearch$, selectSearch] = createSignal<T>();
    const [useValue] = bind(value$, undefined);
    const [useOptions] = bind(Array.isArray(options$) ? of(options$) : options$, []);

    return {
        change$,
        selectSearch$,
        component: ({
            children,
            className = "",
            disabled = false,
            placeholder,
            showSearch = true,
            label,
        }: PropsWithChildren & DropdownProps) => {
            const select = (
                <Select
                    className={(className ? className : "") + ""}
                    onChange={change}
                    disabled={disabled}
                    placeholder={placeholder}
                    showSearch={showSearch}
                    onSearch={(v) => selectSearch(v as T)}
                    value={useValue()}
                >
                    {children}
                    {useOptions().map((option) => (
                        <Select.Option key={option} value={option}>
                            {option}
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
        },
    };
}

type DropdownProps2<T extends Key> = {
    className?: string;
    label?: string;
    options: Observable<T[]> | T[];
    value$?: Observable<T>;
    wire: Subject<T>;
};

export function Dropdown<T extends Key>({
    label,
    children,
    options,
    value$,
    wire,
    ...selectProps
}: PropsWithChildren<DropdownProps2<T>> & Omit<SelectProps, "onChange" | "value" | "options">) {
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
