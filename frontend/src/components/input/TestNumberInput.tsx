import { InputNumber, type InputNumberProps } from "antd";
import Title from "antd/es/typography/Title";
import Info from "components/Info";
import type { ReactNode } from "react";
import Nbsp from "util/Nbsp";

export function TestNumberInput<T extends number | undefined>({
    label,
    subLabel,
    getter,
    info,
    required,
    ...defaultProps
}: { getter: () => T; required?: boolean; label?: ReactNode; subLabel?: ReactNode; info?: ReactNode } & Omit<
    InputNumberProps<number>,
    "value"
>) {
    const requiredElement = required && (
        <>
            <Nbsp />*
        </>
    );

    return (
        <div>
            {label &&
                (info ? (
                    <Title level={5}>
                        <Info text={info}>
                            {label}
                            {requiredElement}
                        </Info>
                        {subLabel && <p className={"text-base-light text-xs"}>{subLabel}</p>}
                    </Title>
                ) : (
                    <Title level={5}>
                        {label}
                        {requiredElement}
                    </Title>
                ))}
            <InputNumber value={getter()} {...defaultProps} />
        </div>
    );
}
