import { type StateObservable, bind, shareLatest, state, useStateObservable } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber, Typography } from "antd";
import type { InputNumberProps } from "antd/es/input-number";
import { liveQuery } from "dexie";
import { type PropsWithChildren, useEffect, useMemo } from "react";
import { EMPTY, type Observable, type Subject, Subscription, from, iif, map, merge, of, sample, switchMap } from "rxjs";
import { combineLatestWith, filter, shareReplay, startWith, withLatestFrom } from "rxjs/operators";
import { P, match } from "ts-pattern";
import { useSubscribe } from "../hooks/UseSubscribe";
import { db } from "../model/db";
import { type Rule, type ValidationResult, validate } from "../model/rules/Rules";
import { guard, isTrue } from "../util/Operators";

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
    validation: Rule<number>[] = [],
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
        map(([snapshot, newValue]) => (newValue === undefined ? snapshot : newValue)),
    );

    const [useValue] = bind(
        focused$.pipe(
            startWith(false),
            switchMap((focused) => (focused ? onChange$ : value$)),
        ),
        undefined,
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
                    /*                    if (result.valid) collection.delete();

                    // If an entry does not exist for this input, add it to the db
                    if (dbValue.length <= 0) db.errors.add({ id, url, messages: result.messages ?? [] });

                    // If an entry exists but the error message has changed, update it
                    collection.modify({ messages: result.messages ?? [] });*/
                },
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
                            <Title level={5}>{id}</Title>
                            {input}
                        </>
                    )) ||
                        input}
                    <div className={"pt-2 text-xs text-error"}>{error !== undefined && error.messages}</div>
                </div>
            );
        },
    };
}

type Conditional<T> = T extends true ? number | undefined : number;

type NumberInputProps2<T extends true | false = false> = {
    label: string;
    showLabel?: boolean;
    allowEmpty?: T | false;
    rules?: Rule<number>[];
    value$: StateObservable<Conditional<T>>;
    wire?: Subject<Conditional<T>>;
};

export function NumberInput<T extends true | false = false>({
    label,
    showLabel = true,
    children,
    allowEmpty = false,
    rules = [],
    value$ = state(of(0)),
    wire,
    ...inputProps
}: PropsWithChildren<NumberInputProps2<T> & InputNumberProps<number>>) {
    // Convert name to an ID so we can reference this element later
    const id = label.toLowerCase().replaceAll(" ", "-");

    // Get the value from the observable
    const { change, focus, output$, useValue, hasErrors } = useMemo(() => {
        const [onChange$, change] = createSignal<number | undefined>();
        const [focused$, focus] = createSignal<boolean>();

        // If allowEmpty is false, reset to a snapshot of the value when first focused
        const resetIfUndefined$ = value$.pipe(
            sample(focused$.pipe(isTrue())),
            combineLatestWith(onChange$),
            map(([snapshot, newValue]) => (newValue === undefined ? snapshot : newValue)),
        );

        const [useValue] = bind<number | ValidationResult<number> | undefined>(
            focused$.pipe(
                startWith(false),
                switchMap((focused) => (focused ? onChange$ : value$.pipe(shareReplay(1)))),
            ),
            undefined,
        );

        const output$ = iif(() => allowEmpty, onChange$, resetIfUndefined$) as Observable<Conditional<T>>;
        const [hasErrors, errors$] = bind(
            (merge(value$.pipe(shareReplay(1)), output$) as Observable<number | undefined>).pipe(
                guard(),
                validate(...rules),
            ),
            undefined,
        );

        return { change, focus, output$, useValue, hasErrors };
    }, [rules, allowEmpty, value$]);

    useEffect(() => {
        const sub = output$.subscribe(wire);
        return () => sub.unsubscribe();
    }, [output$, wire]);

    const value = useValue();

    // Check whether we have error message
    const error = match(hasErrors())
        .with({ type: "invalid", messages: P.select() }, (messages) => messages)
        .otherwise(() => undefined);

    const input = (
        <InputNumber
            id={id}
            onFocus={() => focus(true)}
            onBlur={() => focus(false)}
            onChange={(value) => change(value === null ? undefined : value)}
            // Display the value directly or get it out of the validation result
            value={match(value)
                .with(P.number, (value) => value)
                .with({ value: P.select() }, (value) => value)
                .otherwise(() => undefined)}
            status={error === undefined ? "" : "error"}
            {...inputProps}
        >
            {children}
        </InputNumber>
    );

    return (
        <div>
            {(showLabel && (
                <>
                    <Title level={5}>{label}</Title>
                    {input}
                </>
            )) ||
                input}
            <div className={"pt-2 text-xs text-error"}>{error}</div>
        </div>
    );
}
