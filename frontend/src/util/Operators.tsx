import { confirm as modalConfirm, type ConfirmConfig } from "components/modal/ConfirmationModal";
import type { Collection, Table } from "dexie";
import {
    count,
    from,
    groupBy,
    mergeMap,
    type Observable,
    type ObservableInputTuple,
    of,
    type OperatorFunction,
    pipe,
    scan,
    Subject,
    switchMap,
    type UnaryFunction,
} from "rxjs";
import { catchError, filter, map, shareReplay, toArray, withLatestFrom } from "rxjs/operators";

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

/**
 * Operator that opens a confirmation modal with the given title and message and waits until the modal is confirmed
 * before outputting a value
 *
 * @param title The title of the modal
 * @param message The message to display inside the modal
 * @param config Extra configuration options to pass to the confirmation modal component.
 */
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

/**
 * Operator that takes an observable of objects and returns an observable of the value of a given property
 * of each object.
 *
 * @param property The property to extract from each object. Must be a key of the type parameter `T`.
 *
 * @returns An observable of the value of the given property of each object.
 */
export function property<T, K extends keyof T>(property: K): UnaryFunction<Observable<T>, Observable<T[K]>> {
    return pipe(map((obj) => obj[property]));
}

export function isConstant<T>(): UnaryFunction<Observable<T | T[] | undefined>, Observable<boolean>> {
    return pipe(map((value) => !Array.isArray(value)));
}

export namespace DexieOps {
    /**
     * Given a Dexie table and an observable of IDs, returns an observable of Collections that correspond to the given IDs.
     *
     * @param table The Dexie table to query
     * @returns An observable of Collections that correspond to the given IDs.
     */
    export function byId<T>(table: Table<T, number>): UnaryFunction<Observable<number>, Observable<Collection<T>>> {
        return pipe(map((id: number) => table.where("id").equals(id)));
    }

    /**
     * Given an observable of collections, returns an observable of the first item in each collection. If the
     * collection is empty, the resulting observable will not emit anything.
     *
     * @returns An observable of the first item in each collection.
     */
    export function first<T>(): UnaryFunction<Observable<Collection<T>>, Observable<T>> {
        return pipe(
            switchMap((collection) => collection.first()),
            guard(),
        );
    }
}

export function sampleOne<A>(sampler: Observable<unknown>, input: Observable<A>): Observable<A> {
    return sampler.pipe(
        withLatestFrom(input),
        map(([, a]) => a),
    );
}

export function sampleMany<T, Rest extends unknown[]>(
    sampler: Observable<unknown>,
    inputs: [...ObservableInputTuple<Rest>],
): Observable<[...Rest]> {
    return sampler.pipe(
        withLatestFrom(...inputs),
        map(([_, ...inputs]) => [...inputs]),
    );
}

/**
 * Only lets the observable emit when the given gate observable is currently true.
 * @param gate the observable to gate behind.
 * @param predicate
 */
export function gate<A, B>(gate: Observable<B>, predicate: (b: B) => boolean): OperatorFunction<A, A> {
    return pipe(
        withLatestFrom(gate),
        filter(([, gate]) => predicate(gate)),
        map(([t]) => t),
    );
}
