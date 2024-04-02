import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { EMPTY, map, Observable, sample, switchMap } from "rxjs";
import { InputNumberProps } from "antd/es/input-number";
import { combineLatestWith, filter, startWith } from "rxjs/operators";
import { Rule, validate } from "../model/rules/Rules";
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
    allowEmpty: T | false = false,
    validation: Rule<number>[] = []
): NumberInput<T extends true ? number | undefined : number> {
    type Conditional = T extends true ? number | undefined : number;

    const [onChange$, onChange] = createSignal<number | undefined>();
    const [focused$, focus] = createSignal<boolean>();

    const [useValidated, validated$] = bind(onChange$.pipe(guard(), validate(...validation)), undefined);

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
            useSubscribe(validated$, (result) => )

            const validated = useValidated();

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
                        <div className={"pt-2 text-xs text-error"}>
                            {validated !== undefined && !validated?.valid && validated.messages}
                        </div>
                    </div>
                )) ||
                input
            );
        }
    };
}
