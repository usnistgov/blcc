import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Input, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { EMPTY, Observable } from "rxjs";

export type TextAreaProps = {
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    bordered?: boolean;
    rows?: number;
    label?: string;
};

const { TextArea } = Input;
const { Title } = Typography;

export type TextArea = {
    onChange$: Observable<string>;
    component: React.FC<PropsWithChildren & TextAreaProps>;
};

export default function textArea(value$: Observable<string | undefined> = EMPTY): TextArea {
    const [onChange$, onChange] = createSignal<string>();
    const [useValue] = bind(value$, undefined);

    return {
        onChange$,
        component: ({
            children,
            className,
            disabled = false,
            bordered = true,
            placeholder,
            rows = 4,
            label
        }: PropsWithChildren & TextAreaProps) => {
            return (
                <>
                    <Title level={5}>{label}</Title>
                    <TextArea
                        className={(className ?? "") + "w-44"}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder={placeholder}
                        bordered={bordered}
                        disabled={disabled}
                        rows={rows}
                        value={useValue()}
                    >
                        {children}
                    </TextArea>
                </>
            );
        }
    };
}
