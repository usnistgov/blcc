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
    change$: Observable<string>;
    component: React.FC<PropsWithChildren & DropdownProps>;
};

const onSelect = (value: string) => {
    console.log("select", value); // only for testing
    return value;
};

const onSearch = (value: string) => {
    console.log("searching", value); // only for testing
    return value;
};

/**
 * Creates a dropdown component and its associated change stream.
 */
export default function dropdown(): Dropdown {
    const [change$, change] = createSignal<string>();

    return {
        change$,
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
                    className={(className ? className : "") + " px-2 w-44"}
                    onChange={change}
                    disabled={disabled}
                    placeholder={placeholder}
                    showSearch={showSearch}
                    onSelect={onSelect}
                    onSearch={onSearch}
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
