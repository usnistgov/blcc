import { bind, shareLatest, state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber } from "antd";
import type { InputNumberProps } from "antd/es/input-number";
import Title from "antd/es/typography/Title";
import { type Rule, type ValidationResult, validate } from "model/rules/Rules";
import { type PropsWithChildren, useEffect, useMemo } from "react";
import { type Observable, type Subject, iif, map, merge, of, sample, switchMap } from "rxjs";
import { combineLatestWith, shareReplay, startWith } from "rxjs/operators";
import { P, match } from "ts-pattern";
import { guard, isTrue } from "util/Operators";

type NumberOrUndefined<T> = T extends true ? number | undefined : number;

type NumberInputProps<T extends true | false = false> = {
    label: string;
    showLabel?: boolean;
    allowEmpty?: T | false;
    rules?: Rule<number>[];
    value$: Observable<NumberOrUndefined<T>>;
    wire?: Subject<NumberOrUndefined<T>>;
};

export function NumberInput<T extends true | false = false>({
    label,
    showLabel = true,
    children,
    allowEmpty = false,
    rules,
    value$ = state(of(0)),
    wire,
    ...inputProps
}: PropsWithChildren<NumberInputProps<T> & InputNumberProps<number>>) {
    // Convert name to an ID so we can reference this element later
    const id = label.toLowerCase().replaceAll(" ", "-");

    // Get the value from the observable
    const { change, focus, output$, useValue, hasErrors } = useMemo(() => {
        const replayed$ = value$.pipe(shareLatest());

        const [onChange$, change] = createSignal<number | undefined>();
        const [focused$, focus] = createSignal<boolean>();

        // If allowEmpty is false, reset to a snapshot of the value when first focused
        const resetIfUndefined$ = replayed$.pipe(
            sample(focused$.pipe(isTrue())),
            combineLatestWith(onChange$),
            map(([snapshot, newValue]) => (newValue === undefined ? snapshot : newValue)),
        );

        const [useValue, v2$] = bind<number | ValidationResult<number> | undefined>(
            focused$.pipe(
                startWith(false),
                switchMap((focused) => (focused ? onChange$ : replayed$)),
            ),
            undefined,
        );

        // FIXME Required to show some values
        v2$.subscribe(() => {});

        const output$ = iif(() => allowEmpty, onChange$, resetIfUndefined$) as Observable<NumberOrUndefined<T>>;
        const [hasErrors, errors$] = bind(
            (merge(replayed$, output$) as Observable<number | undefined>).pipe(guard(), validate(...(rules ?? []))),
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
