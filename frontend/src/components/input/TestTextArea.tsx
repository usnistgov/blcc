import { Input } from "antd";
import type { TextAreaProps } from "antd/es/input/index";
import Title from "antd/es/typography/Title";
import Info from "components/Info";
import type { ReactNode } from "react";
import Nbsp from "util/Nbsp";

export function TestTextArea<T extends string | undefined>({
    label,
    getter,
    info,
    required,
    ...defaultProps
}: { getter: () => T; required?: boolean; label?: ReactNode; info?: ReactNode } & Omit<TextAreaProps, "value">) {
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
                    </Title>
                ) : (
                    <Title level={5}>
                        {label}
                        {requiredElement}
                    </Title>
                ))}
            <Input.TextArea value={getter()} {...defaultProps} rows={4} />
        </div>
    );
}
