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

export type ValidationResult = { type: "valid" } | { type: "invalid"; messages: string[] };

export function validate<T>(...rules: Rule<T>[]): UnaryFunction<Observable<T>, Observable<ValidationResult>> {
    return pipe(
        map((t: T) => {
            const messages = rules.filter((rule) => !rule.test(t)).map((rule) => rule.message(t));

            if (messages.length > 0)
                return {
                    type: "invalid",
                    messages,
                } as ValidationResult;

            return {
                type: "valid",
            } as ValidationResult;
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

export namespace Rule {
    /**
     * Creates a rule that checks if a string's length does not exceed a specified maximum length.
     *
     * @param maxLength - The maximum allowed length for the string.
     * @returns A Rule<string> that validates the string length against the maximum length.
     */
    export function maxLength<T>(maxLength: number): Rule<string> {
        return {
            name: "Max length rule",
            message: (x: string) => `${x} is longer than the maximum allowed length ${maxLength}`,
            test: (x: string) => x.length <= maxLength,
        };
    }

    /**
     * Creates a rule that checks if a string's length is at least a specified minimum length.
     *
     * @param minLength - The minimum allowed length for the string.
     * @returns A Rule<string> that validates the string length against the minimum length.
     */
    export function minLength(minLength: number): Rule<string> {
        return {
            name: "Min length rule",
            message: (x: string) => `${x} is shorter than the minimum allowed length ${minLength}`,
            test: (x: string) => x.length >= minLength,
        };
    }
}
