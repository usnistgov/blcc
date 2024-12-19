import type { Key, ReactNode } from "react";
import { Select, SelectProps } from "antd";
import Title from "antd/es/typography/Title";
import Info from "components/Info";

export function TestSelect<T extends Key>({
    optionGetter,
    options,
    label,
    showLabel = true,
    getter,
    info,
    required,
    ...selectProps
}: {
    optionGetter?: () => T[];
    options?: T[];
    getter: () => T | undefined;
    showLabel?: boolean;
    required?: boolean;
    label?: ReactNode;
    info?: ReactNode;
} & Omit<SelectProps, "value" | "options">) {
    if (optionGetter === undefined && options === undefined)
        throw new Error("TestSelect requires either an options getter or an array of options");

    const fullOptions: T[] = (optionGetter ? optionGetter() : options) as T[];

    const select = (
        <Select value={getter()} {...selectProps}>
            {fullOptions.map((option) => (
                <Select.Option key={option} value={option}>
                    {option.toString()}
                </Select.Option>
            ))}
        </Select>
    );

    return (
        (label !== undefined && (
            <div>
                {showLabel &&
                    (info ? (
                        <Title level={5}>
                            <Info text={info}>{label}</Info>
                        </Title>
                    ) : (
                        <Title level={5}>{label}</Title>
                    ))}
                {select}
            </div>
        )) ||
        select
    );
}