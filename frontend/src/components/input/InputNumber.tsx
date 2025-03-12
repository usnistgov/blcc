import { bind, shareLatest } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber } from "antd";
import type { InputNumberProps } from "antd/es/input-number";
import Title from "antd/es/typography/Title";
import Info from "components/Info";
import { Match } from "effect";
import { type Rule, validate } from "model/rules/Rules";
import { type PropsWithChildren, type ReactNode, useEffect, useMemo } from "react";
import { type Observable, type Subject, iif, map, merge, sample, switchMap } from "rxjs";
import { combineLatestWith, startWith } from "rxjs/operators";
import { guard, isTrue } from "util/Operators";

type NumberOrUndefined<T> = T extends true ? number | undefined : number;

type NumberInputProps<T extends true | false = false> = {
    label: ReactNode;
    subLabel?: ReactNode;
    id?: string;
    showLabel?: boolean;
    allowEmpty?: T | false;
    rules?: Rule<number>[];
    value$: Observable<NumberOrUndefined<T>>;
    wire?: Subject<NumberOrUndefined<T>>;
    percent?: boolean;
    info?: ReactNode;
};

export function NumberInput<T extends true | false = false>({
    label,
    subLabel,
    id,
    showLabel = true,
    children,
    allowEmpty = false,
    rules,
    value$,
    wire,
    percent,
    info,
    ...inputProps
}: PropsWithChildren<NumberInputProps<T> & InputNumberProps<number>>) {
    // Convert name to an ID so we can reference this element later
    // TODO: Fix ID
    //const id = label.toLowerCase().replaceAll(" ", "-");

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

        const [useValue, v2$] = bind<number | undefined>(
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
    const error = Match.value(hasErrors()).pipe(
        Match.when({ type: "invalid" }, (error) => error.messages),
        Match.orElse(() => undefined),
    );

    const input = (
        <InputNumber
            onFocus={() => focus(true)}
            onBlur={() => focus(false)}
            id={id}
            onChange={(value) => {
                if (value === null) change(undefined);
                else if (percent) change(Number.parseFloat((value / 100).toFixed(4)));
                else change(value);
            }}
            // Display the value directly or get it out of the validation result
            value={Match.type<number | unknown>().pipe(
                Match.when(Match.number, (value) => (percent ? Number.parseFloat((value * 100).toFixed(2)) : value)),
                Match.orElse(() => undefined),
            )(value)}
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
                    {(info && (
                        <Title level={5}>
                            <Info text={info}>{label}</Info>
                            {subLabel && <p className={"text-base-light text-xs"}>{subLabel}</p>}
                        </Title>
                    )) || <Title level={5}>{label}</Title>}
                    {input}
                </>
            )) ||
                input}
            <div className={"pt-2 text-error text-xs"}>{error}</div>
        </div>
    );
}
