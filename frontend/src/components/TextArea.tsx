import { Observable } from "rxjs";
import React, { PropsWithChildren } from "react";
import { createSignal } from "@react-rxjs/utils";
import { Input } from "antd";
import { bind } from "@react-rxjs/core";

export type TextAreaProps = {
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    bordered?: boolean;
    rows?: number;
};

const { TextArea } = Input;

export type TextArea = {
    onChange$: Observable<string>;
    component: React.FC<PropsWithChildren & TextAreaProps>;
};

export default function textArea(value$: Observable<string | undefined>): TextArea {
    const [onChange$, onChange] = createSignal<string>();
    const [value] = bind(value$, undefined);

    return {
        onChange$,
        component: ({
            children,
            className,
            disabled = false,
            bordered = true,
            placeholder,
            rows = 4
        }: PropsWithChildren & TextAreaProps) => {
            return (
                <TextArea
                    className={(className ?? "") + "w-44"}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    bordered={bordered}
                    disabled={disabled}
                    rows={rows}
                    value={value()}
                >
                    {children}
                </TextArea>
            );
        }
    };
}
