import { EMPTY, Observable } from "rxjs";
import React, { PropsWithChildren } from "react";
import { createSignal } from "@react-rxjs/utils";
import { Select } from "antd";
import { bind } from "@react-rxjs/core";

export type DropdownProps = {
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    showSearch?: boolean;
    value?: string;
};

export type Dropdown<T> = {
    change$: Observable<T>;
    selectSearch$: Observable<T>;
    component: React.FC<PropsWithChildren & DropdownProps>;
};

/**
 * Creates a dropdown component and its associated change stream.
 */
export default function dropdown<T extends string>(
    options: T[],
    value$: Observable<T | undefined> = EMPTY
): Dropdown<T> {
    const [change$, change] = createSignal<T>();
    const [selectSearch$, selectSearch] = createSignal<T>();
    const [useValue] = bind(value$, undefined);

    return {
        change$,
        selectSearch$,
        component: ({
            children,
            className = "",
            disabled = false,
            placeholder,
            showSearch = true
        }: PropsWithChildren & DropdownProps) => {
            return (
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
                    {options.map((option) => (
                        <Select.Option key={option} value={option}>
                            {option}
                        </Select.Option>
                    ))}
                </Select>
            );
        }
    };
}
