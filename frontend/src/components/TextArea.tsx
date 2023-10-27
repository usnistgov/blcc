import { Observable } from "rxjs";
import React, { PropsWithChildren } from "react";
import { createSignal } from "@react-rxjs/utils";
import { Input } from "antd";

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

export default function textArea(): TextArea {
    const [onChange$, onChange] = createSignal<string>();

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
                    className={className ?? ""}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    bordered={bordered}
                    disabled={disabled}
                    rows={rows}
                >
                    {children}
                </TextArea>
            );
        }
    };
}
