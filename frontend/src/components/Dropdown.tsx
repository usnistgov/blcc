import { Observable } from "rxjs";
import React, { PropsWithChildren } from "react";
import { createSignal } from "@react-rxjs/utils";
import { Select } from "antd";

export type DropdownProps = {
    className?: string;
    options: (number | string)[];
    disabled?: boolean;
    placeholder?: string;
    showSearch?: boolean;
};

export type Dropdown = {
    change$: Observable<string | number>;
    selectSearch$: Observable<string | number>;
    component: React.FC<PropsWithChildren & DropdownProps>;
};

/**
 * Creates a dropdown component and its associated change stream.
 */
export default function dropdown(): Dropdown {
    const [change$, change] = createSignal<string | number>();
    const [selectSearch$, selectSearch] = createSignal<string | number>();

    return {
        change$,
        selectSearch$,
        component: ({
            children,
            className,
            options,
            disabled = false,
            placeholder,
            showSearch = true
        }: PropsWithChildren & DropdownProps) => {
            return (
                <Select
                    className={(className ? className : "") + "w-44"}
                    onChange={change}
                    disabled={disabled}
                    placeholder={placeholder}
                    showSearch={showSearch}
                    onSearch={selectSearch}
                >
                    {children}
                    {options?.map((option) => (
                        <Select.Option key={option} value={option}>
                            {option}
                        </Select.Option>
                    ))}
                </Select>
            );
        }
    };
}
