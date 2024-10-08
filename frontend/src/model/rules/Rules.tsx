import type { Alternative } from "blcc-format/Format";
import { type Observable, type UnaryFunction, map, pipe } from "rxjs";

export type RuleContext = {
    originator: string;
    url: string;
};

export type Rule<T> = {
    name?: string;
    message: (t: T) => string;
    test: (t: T) => boolean;
};

export type ValidationResult<T> = { type: "valid"; value: T } | { type: "invalid"; messages: string[]; value: T };

export function validate<T>(...rules: Rule<T>[]): UnaryFunction<Observable<T>, Observable<ValidationResult<T>>> {
    return pipe(
        map((t: T) => {
            const messages = rules.filter((rule) => !rule.test(t)).map((rule) => rule.message(t));

            if (messages.length > 0)
                return {
                    type: "invalid",
                    messages,
                    value: t,
                } as ValidationResult<T>;

            return {
                type: "valid",
                value: t,
            } as ValidationResult<T>;
        }),
    );
}

export function max(maxValue: number): Rule<number> {
    return {
        name: "Max value rule",
        message: (x: number) => `${x} is larger than the maximum allowed value ${maxValue}`,
        test: (x: number) => x <= maxValue,
    };
}

export function min(minValue: number): Rule<number> {
    return {
        name: "Min value rule",
        message: (x: number) => `${x} is lower than the minimum allowed value ${minValue}`,
        test: (x: number) => x >= minValue,
    };
}

const HAS_BASELINE: Rule<Alternative[]> = {
    name: "At least one baseline alternative",
    test: (alts) => alts.find((alt) => alt.baseline) !== undefined,
    message: () => "Must have at least one baseline alternative",
};
