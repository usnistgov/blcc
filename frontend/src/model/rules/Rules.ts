import { Observable, UnaryFunction, filter, from, map, pipe, switchMap, toArray } from "rxjs";

export type Rule<T> = {
    name?: string;
    message: (t: T) => string;
    test: (t: T) => boolean;
};

export function validate<T>(...rules: Rule<T>[]): UnaryFunction<Observable<T>, Observable<T>> {
    return pipe(
        switchMap((t: T) =>
            from(rules).pipe(
                filter((rule) => !rule.test(t)),
                map((rule) => rule.message(t)),
                toArray(),
                map((errors) => {
                    if (errors.length > 0) throw errors;
                    return t;
                })
            )
        )
    );
}

export function max(maxValue: number): Rule<number> {
    return {
        name: "Max value rule",
        message: (x: number) => `${x} is larger than the maximum allowed value ${maxValue}`,
        test: (x: number) => x <= maxValue
    };
}
