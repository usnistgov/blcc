import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Input, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { EMPTY, Observable, switchMap } from "rxjs";
import { startWith } from "rxjs/operators";

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
    const [focused$, focus] = createSignal<boolean>();

    const [useValue] = bind(
        focused$.pipe(
            startWith(false),
            switchMap((focused) => (focused ? onChange$ : value$))
        ),
        undefined
    );

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
                        onFocus={() => focus(true)}
                        onBlur={() => focus(false)}
                        className={(className ?? "") + "w-44"}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder={placeholder}
                        variant={bordered ? "outlined" : "borderless"}
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
