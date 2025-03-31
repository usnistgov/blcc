import { Input, type InputProps } from "antd";
import Title from "antd/es/typography/Title";
import Info from "components/Info";
import { TextInputType } from "components/input/TextInput";
import type { ReactNode } from "react";
import Nbsp from "util/Nbsp";
import type { ZodError } from "zod";

export function TestInput<T extends string | undefined>({
    label,
    getter,
    info,
    required,
    disabled,
    error,
    ...defaultProps
}: {
    getter: () => T;
    required?: boolean;
    disabled?: boolean;
    label?: ReactNode;
    info?: ReactNode;
    error?: () => ZodError | undefined;
} & Omit<InputProps, "value" | "status">) {
    const requiredElement = required && (
        <>
            <Nbsp />*
        </>
    );

    const err = error?.();

    return (
        <div>
            {label &&
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
            <Input
                type={TextInputType.PRIMARY}
                value={getter()}
                status={err && !disabled ? "error" : undefined}
                disabled={disabled}
                {...defaultProps}
            />
            {!disabled &&
                err?.issues.map((error) => (
                    <p key={error.code} style={{ color: "red" }}>
                        {error.message}
                    </p>
                ))}
        </div>
    );
}
