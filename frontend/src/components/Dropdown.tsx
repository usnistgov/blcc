import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Select, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { EMPTY, Observable, of } from "rxjs";

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
    value$: Observable<T | undefined> = EMPTY
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
            label
        }: PropsWithChildren & DropdownProps) => {
            return (
                <div>
                    <Title level={5}>{label}</Title>
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
                </div>
            );
        }
    };
}
