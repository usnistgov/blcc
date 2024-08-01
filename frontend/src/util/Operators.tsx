import { type ConfirmConfig, confirm as modalConfirm } from "components/modal/ConfirmationModal";
import {
    type Observable,
    Subject,
    type UnaryFunction,
    count,
    from,
    groupBy,
    mergeMap,
    of,
    pipe,
    scan,
    switchMap,
} from "rxjs";
import { catchError, filter, map, shareReplay, toArray } from "rxjs/operators";

/**
 * Counts the number of occurrences of each unique property in type A. The property is obtained with the given property extractor function.
 */
export function countProperty<A, B extends string>(
    propertyExtractor: (cost: A) => B,
): UnaryFunction<Observable<A[]>, Observable<[B, number][]>> {
    return pipe(
        mergeMap((costs) =>
            from(costs).pipe(
                groupBy((cost) => propertyExtractor(cost)),
                mergeMap(
                    (group$) =>
                        group$.pipe(
                            count(),
                            map((count) => [group$.key, count]),
                        ) as Observable<[B, number]>,
                ),
                toArray(),
            ),
        ),
    );
}

/**
 * Creates an operator that filters an array contained inside a stream.
 */
export function arrayFilter<A>(predicate: (a: A) => boolean): UnaryFunction<Observable<A[]>, Observable<A[]>> {
    return pipe(map((array) => array.filter(predicate)));
}

export function guard<A>(): UnaryFunction<Observable<A | undefined>, Observable<A>> {
    return pipe(filter((a): a is A => a !== undefined));
}

export function defaultValue<A, B>(defaultValue: B): UnaryFunction<Observable<A>, Observable<A | B>> {
    return pipe(map((a) => (a ? a : defaultValue)));
}

export function parseHtml(): UnaryFunction<Observable<Response>, Observable<string>> {
    return pipe(
        mergeMap((result) => result.text()),
        shareReplay(1),
        catchError(() => of("")),
    );
}

export function isTrue(): UnaryFunction<Observable<boolean>, Observable<boolean>> {
    return pipe(filter((bool) => bool));
}

export function isFalse(): UnaryFunction<Observable<boolean>, Observable<boolean>> {
    return pipe(filter((bool) => !bool));
}

export function toggle<T>(set: Set<T>, value: T): Set<T> {
    if (set.has(value)) set.delete(value);
    else set.add(value);

    return set;
}

export function gatherSet<T>(...seed: T[]): UnaryFunction<Observable<T>, Observable<Set<T>>> {
    return pipe(
        scan((acc, value) => {
            if (!acc.has(value)) acc.add(value);
            else acc.delete(value);

            return new Set(acc.values());
        }, new Set(seed)),
    );
}

export function gatherArray<T>(...seed: T[]): UnaryFunction<Observable<T>, Observable<T[]>> {
    return pipe(
        scan(
            (acc, value) => {
                const index = acc.indexOf(value);
                if (index === -1) acc.push(value);
                else acc.splice(index, 1);

                return acc;
            },
            [...seed],
        ),
    );
}

export function confirm<T>(
    title: string,
    message: string,
    config?: ConfirmConfig,
): UnaryFunction<Observable<T>, Observable<T>> {
    return pipe(
        switchMap((value) => {
            const confirm$ = new Subject<void>();
            modalConfirm(title, message, confirm$, config);
            return confirm$.pipe(map(() => value));
        }),
    );
}
