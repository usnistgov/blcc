import { Select, type SelectProps } from "antd";
import Title from "antd/es/typography/Title";
import Info from "components/Info";
import type { Key, ReactNode } from "react";
import Nbsp from "util/Nbsp";
import { ZodError } from "zod";

export function TestSelect<T extends Key>({
    optionGetter,
    options,
    label,
    showLabel = true,
    getter,
    info,
    error,
    required,
    ...selectProps
}: {
    optionGetter?: () => T[];
    options?: T[];
    getter: () => T | undefined;
    showLabel?: boolean;
    required?: boolean;
    label?: ReactNode;
    error?: () => ZodError | undefined;
    info?: ReactNode;
} & Omit<SelectProps, "value" | "options">) {
    if (optionGetter === undefined && options === undefined)
        throw new Error("TestSelect requires either an options getter or an array of options");

    const fullOptions: T[] = (optionGetter ? optionGetter() : options) as T[];

    const requiredElement = required && (
        <>
            <Nbsp />*
        </>
    );

    const err = error?.();

    const select = (
        <>
            <Select value={getter()} {...selectProps} status={err ? "error" : undefined}>
                {fullOptions.map((option) => (
                    <Select.Option key={option} value={option}>
                        {option.toString()}
                    </Select.Option>
                ))}
            </Select>
            {err?.issues.map((error) => (
                <p key={error.code} style={{ color: "red" }}>
                    {error.message}
                </p>
            ))}
        </>
    );

    return (
        (label !== undefined && (
            <div>
                {showLabel &&
                    (info ? (
                        <Title level={5}>
                            <Info text={info}>
                                {label}
                                {requiredElement}
                            </Info>
                        </Title>
                    ) : (
                        <Title level={5}>
                            {label}
                            {requiredElement}
                        </Title>
                    ))}
                {select}
            </div>
        )) ||
        select
    );
}
