import { Observable, UnaryFunction, map, pipe } from "rxjs";

export type Rule<T> = {
    name?: string;
    message: (t: T) => string;
    test: (t: T) => boolean;
};

export type ValidationResult<T> = {
    valid: boolean;
    messages?: string[];
    value?: T;
};

export function validate<T>(...rules: Rule<T>[]): UnaryFunction<Observable<T>, Observable<ValidationResult<T>>> {
    return pipe(
        map((t: T) => {
            const messages = rules.filter((rule) => !rule.test(t)).map((rule) => rule.message(t));

            if (messages.length > 0)
                return {
                    valid: false,
                    messages
                };

            return {
                valid: true,
                value: t
            };
        })
    );
}

export function max(maxValue: number): Rule<number> {
    return {
        name: "Max value rule",
        message: (x: number) => `${x} is larger than the maximum allowed value ${maxValue}`,
        test: (x: number) => x <= maxValue
    };
}

export function min(minValue: number): Rule<number> {
    return {
        name: "Min value rule",
        message: (x: number) => `${x} is lower than the minium allowed value ${minValue}`,
        test: (x: number) => x >= minValue
    };
}
