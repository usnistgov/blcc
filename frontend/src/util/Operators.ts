import { count, from, groupBy, mergeMap, type Observable, of, pipe, type UnaryFunction } from "rxjs";
import { catchError, filter, map, shareReplay, toArray } from "rxjs/operators";

/**
 * Counts the number of occurrences of each unique property in type A. The property is obtained with the given property extractor function.
 */
export function countProperty<A, B extends string>(
    propertyExtractor: (cost: A) => B
): UnaryFunction<Observable<A[]>, Observable<[B, number][]>> {
    return pipe(
        mergeMap((costs) =>
            from(costs).pipe(
                groupBy((cost) => propertyExtractor(cost)),
                mergeMap(
                    (group$) =>
                        group$.pipe(
                            count(),
                            map((count) => [group$.key, count])
                        ) as Observable<[B, number]>
                ),
                toArray()
            )
        )
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
        catchError(() => of(""))
    );
}

export function isTrue(): UnaryFunction<Observable<boolean>, Observable<boolean>> {
    return pipe(filter((bool) => bool))
}

export function isFalse(): UnaryFunction<Observable<boolean>, Observable<boolean>> {
    return pipe(filter((bool) => bool === false))
}
