/* eslint @typescript-eslint/no-explicit-any: 0 */

import { firstValueFrom, forkJoin, map, merge, Observable, pipe, startWith } from "rxjs";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";

export type Streams<T> = {
    [A in keyof T as `${string & A}$`]: Observable<T[A]>;
};

export type Model<T> = T & Streams<T>;

export function createTopLevelModel<A, B>(stream$: Observable<B>, initial: Partial<B>): Model<A> {
    const result: any = {};

    Object.keys(initial).map((key) => {
        const [signal$, setSignal] = createSignal<any>();
        const middle$ = merge(signal$, stream$.pipe(map((b) => b[key as keyof B])));

        const [useSignal] = bind(middle$, initial[key as keyof B]);

        result[`${key}$`] = middle$;
        Object.defineProperty(result, key, {
            get: function () {
                return useSignal();
            },
            set: function (value) {
                setSignal(value);
            },
            enumerable: true
        });
    });

    return result as Model<A>;
}

export function createModel<A, B>(model: B): Model<A> {
    const result: any = {};

    const streams: any = {};
    const signals: any = {};

    Object.keys(model as object).map((key) => {
        const [signal$, setSignal] = createSignal<any>();
        const middle$ = merge(signal$, model[key as keyof B] as Observable<any>);

        streams[key] = middle$;
        signals[key] = setSignal;

        result[`${key}$`] = middle$;
    });

    Object.keys(model as object).map(async (key) => {
        const [useSignal] = bind(streams[key], await firstValueFrom(model[key as keyof B] as Observable<any>));
        const setSignal = signals[key];

        Object.defineProperty(result, key, {
            get: function () {
                return useSignal();
            },
            set: function (value) {
                setSignal(value);
            },
            enumerable: true
        });
    });

    return result as Model<A>;
}

export function modelProperty<A, B>(extractor: (a: A) => B, initial?: B) {
    return pipe(map(extractor), startWith(initial));
}
