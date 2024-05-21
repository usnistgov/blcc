import { type StateObservable, bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Input, type InputProps } from "antd";
import Title from "antd/es/typography/Title";
import { type PropsWithChildren, useEffect, useMemo } from "react";
import { EMPTY, type Observable, type Subject, switchMap } from "rxjs";
import { startWith } from "rxjs/operators";
import { TextInputType } from "./TextInput";

export type TextAreaProps = {
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    bordered?: boolean;
    rows?: number;
    label?: string;
};

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
            switchMap((focused) => (focused ? onChange$ : value$)),
        ),
        undefined,
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
            label,
        }: PropsWithChildren & TextAreaProps) => {
            return (
                <>
                    <Title level={5}>{label}</Title>
                    <Input.TextArea
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
                    </Input.TextArea>
                </>
            );
        },
    };
}

type TextAreaProps2 = {
    label: string;
    className?: string;
    value$: StateObservable<string | undefined>;
    wire: Subject<string | undefined>;
};

export function TextArea({
    label,
    children,
    value$,
    wire,
    className,
    disabled,
    ...defaultProps
}: PropsWithChildren<TextAreaProps2 & InputProps>) {
    const { useValue, focus, onChange, onChange$ } = useMemo(() => {
        const [onChange$, onChange] = createSignal<string | undefined>();
        const [focused$, focus] = createSignal<boolean>();

        const [useValue] = bind(
            focused$.pipe(
                startWith(false),
                switchMap((focused) => (focused ? onChange$ : value$)),
            ),
            undefined,
        );

        return { useValue, focus, onChange, onChange$ };
    }, [value$]);

    useEffect(() => {
        onChange$.subscribe(wire);
    }, [wire, onChange$]);

    return (
        <div>
            <Title level={5}>{label}</Title>
            <Input.TextArea
                onChange={(e) => {
                    console.log("Text area change", e);
                    onChange(e.currentTarget.value);
                }}
                onFocus={() => focus(true)}
                onBlur={() => focus(false)}
                className={`${className ?? ""} w-44`}
                value={useValue()}
                {...defaultProps}
            >
                {children}
            </Input.TextArea>
        </div>
    );
}
