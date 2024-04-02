import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { combineLatest, EMPTY, from, map, Observable, sample, switchMap } from "rxjs";
import { InputNumberProps } from "antd/es/input-number";
import { combineLatestWith, filter, startWith, withLatestFrom } from "rxjs/operators";
import { Rule, validate } from "../model/rules/Rules";
import { guard } from "../util/Operators";
import { db } from "../model/db";
import { useSubscribe } from "../hooks/UseSubscribe";
import { liveQuery } from "dexie";

export type NumberInputProps = {
    label?: boolean;
} & InputNumberProps<number>;

export type NumberInput<T> = {
    onChange$: Observable<T>;
    component: React.FC<PropsWithChildren & NumberInputProps>;
};

const { Title } = Typography;

export default function numberInput<T extends true | false = false>(
    id: string,
    url: string,
    value$: Observable<T extends true ? number | undefined : number> = EMPTY,
    allowEmpty: T | false = false,
    validation: Rule<number>[] = []
): NumberInput<T extends true ? number | undefined : number> {
    type Conditional = T extends true ? number | undefined : number;

    const [onChange$, onChange] = createSignal<number | undefined>();
    const [focused$, focus] = createSignal<boolean>();

    const validated$ = onChange$.pipe(guard(), validate(...validation));
    const [hasError] = bind(from(liveQuery(() => db.errors.where("id").equals(id).first())), undefined);

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
        component: ({ children, label = true, ...inputProps }: PropsWithChildren & NumberInputProps) => {
            useSubscribe(
                validated$.pipe(withLatestFrom(from(liveQuery(() => db.errors.where("id").equals(id).toArray())))),
                ([result, dbValue]) => {
                    if (result === undefined) return;

                    const collection = db.errors.where("id").equals(id);

                    // If the validation succeeded, remove error from db
                    if (result.valid) collection.delete();

                    // If an entry does not exist for this input, add it to the db
                    if (dbValue.length <= 0) db.errors.add({ id, url, messages: result.messages ?? [] });

                    // If an entry exists but the error message has changed, update it
                    collection.modify({ messages: result.messages ?? [] });
                }
            );

            const error = hasError();

            const input = (
                <InputNumber
                    id={id.replaceAll(" ", "-")}
                    onFocus={() => focus(true)}
                    onBlur={() => focus(false)}
                    onChange={(value) => onChange(value === null ? undefined : value)}
                    value={useValue()}
                    status={error === undefined ? "" : "error"}
                    {...inputProps}
                >
                    {children}
                </InputNumber>
            );

            return (
                <div>
                    {(label && (
                        <>
                            <Title level={5}>{label}</Title>
                            {input}
                        </>
                    )) ||
                        input}
                    <div className={"pt-2 text-xs text-error"}>{error !== undefined && error.messages}</div>
                </div>
            );
        }
    };
}
