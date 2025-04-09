import { InputNumber, type InputNumberProps, Tooltip } from "antd";
import Title from "antd/es/typography/Title";
import Info from "components/Info";
import type { ReactNode } from "react";
import Nbsp from "util/Nbsp";
import type { ZodError } from "zod";

export function TestNumberInput<T extends number | undefined>({
    getter,
    info,
    label,
    required,
    subLabel,
    tooltip,
    warning,
    error,
    ...defaultProps
}: {
    getter: () => T;
    info?: ReactNode;
    label?: ReactNode;
    required?: boolean;
    subLabel?: ReactNode;
    tooltip?: ReactNode;
    warning?: string;
    error?: () => ZodError | undefined;
} & Omit<InputNumberProps<number>, "value">) {
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
                    tooltip ? (
                        <Info text={info}>
                            <Title level={5}>
                                <Tooltip title={tooltip}>
                                    {label}
                                    {requiredElement}
                                    {subLabel && <p className={"text-base-light text-xs"}>{subLabel}</p>}
                                </Tooltip>
                            </Title>
                        </Info>
                    ) : (
                        <Title level={5}>
                            <Info text={info}>
                                {label}
                                {requiredElement}
                            </Info>
                            {subLabel && <p className={"text-base-light text-xs"}>{subLabel}</p>}
                        </Title>
                    )
                ) : (
                    <Title level={5}>
                        {label}
                        {requiredElement}
                    </Title>
                ))}
            <InputNumber value={getter()} {...defaultProps} status={err ? "error" : warning ? "warning" : undefined} />
            {err?.issues.map((error) => (
                <p key={error.code} style={{ color: "red" }}>
                    {error.message}
                </p>
            )) || <p style={{ color: "#faad14" }}>{warning}</p>}
        </div>
    );
}
