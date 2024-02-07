import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { EMPTY, iif, map, merge, Observable, of, sample, switchAll, switchMap } from "rxjs";
import { InputNumberProps } from "antd/es/input-number";
import { combineLatestWith, filter, startWith, withLatestFrom } from "rxjs/operators";
import { guard } from "../util/Operators";

export type NumberInputProps = {
    label?: string;
} & InputNumberProps<number>;

export type NumberInput<T> = {
    onChange$: Observable<T>;
    component: React.FC<PropsWithChildren & NumberInputProps>;
};

const { Title } = Typography;

export default function numberInput<T extends true | false = false>(
    value$: Observable<T extends true ? number | undefined : number> = EMPTY,
    allowEmpty: T | false = false
): NumberInput<T extends true ? number | undefined : number> {
    type Conditional = T extends true ? number | undefined : number;

    const [onChange$, onChange] = createSignal<number | undefined>();
    const [focused$, focus] = createSignal<boolean>();

    // If allowEmpty is false, reset to a snapshot of the value when first focused
    const focusInitiated$ = focused$.pipe(filter((focused) => focused));
    const resetIfUndefined$ = (value$ as Observable<number>).pipe(
        sample(focusInitiated$),
        combineLatestWith(onChange$ as Observable<number>),
        map(([snapshot, newValue]) => (newValue === undefined ? snapshot : newValue))
    );

    const [useValue] = bind(
        focused$.pipe(
            startWith(false),
            switchMap((focused) => (focused ? onChange$ : value$))
        ),
        undefined
    );

    return {
        onChange$: allowEmpty ? (onChange$ as Observable<Conditional>) : (resetIfUndefined$ as Observable<Conditional>),
        component: ({ children, label, ...inputProps }: PropsWithChildren & NumberInputProps) => {
            const input = (
                <InputNumber
                    onFocus={() => focus(true)}
                    onBlur={() => focus(false)}
                    onChange={(value) => onChange(value === null ? undefined : value)}
                    value={useValue()}
                    {...inputProps}
                >
                    {children}
                </InputNumber>
            );

            return (
                (label !== undefined && (
                    <div>
                        <Title level={5}>{label}</Title>
                        {input}
                    </div>
                )) ||
                input
            );
        }
    };
}
