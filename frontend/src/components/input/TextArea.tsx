import { type StateObservable, bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Input } from "antd";
import type { TextAreaProps as DefaultProps } from "antd/es/input";
import Title from "antd/es/typography/Title";
import { type PropsWithChildren, type ReactNode, useEffect, useMemo } from "react";
import { type Subject, switchMap } from "rxjs";
import { startWith } from "rxjs/operators";
import Info from "components/Info";

type TextAreaProps = {
    label: string;
    className?: string;
    value$: StateObservable<string | undefined>;
    wire: Subject<string | undefined>;
    info?: ReactNode;
};

export function TextArea({
    label,
    children,
    value$,
    wire,
    className,
    disabled,
    info,
    ...defaultProps
}: PropsWithChildren<TextAreaProps & DefaultProps>) {
    const { useValue, focus, textChange, onChange$ } = useMemo(() => {
        const [onChange$, textChange] = createSignal<string | undefined>();
        const [focused$, focus] = createSignal<boolean>();

        const [useValue] = bind(
            focused$.pipe(
                startWith(false),
                switchMap((focused) => (focused ? onChange$ : value$)),
            ),
            undefined,
        );

        return { useValue, focus, textChange, onChange$ };
    }, [value$]);

    useEffect(() => {
        onChange$.subscribe(wire);
    }, [wire, onChange$]);

    return (
        <div>
            {info ? (
                <Title level={5}>
                    <Info text={info}>{label}</Info>
                </Title>
            ) : (
                <Title level={5}>{label}</Title>
            )}
            <Input.TextArea
                onChange={(e) => textChange(e.currentTarget.value)}
                onFocus={() => focus(true)}
                onBlur={() => focus(false)}
                rows={4}
                className={`${className ?? ""} w-44`}
                value={useValue()}
                {...defaultProps}
            >
                {children}
            </Input.TextArea>
        </div>
    );
}
