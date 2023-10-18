/* eslint @typescript-eslint/no-explicit-any: 0 */

import {
    combineLatest,
    firstValueFrom,
    forkJoin,
    map,
    merge,
    Observable,
    of,
    pipe,
    startWith,
    switchMap,
    UnaryFunction
} from "rxjs";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";

type Primitive = string | boolean | number | bigint | symbol | undefined;
type Excluded = { json: any; json$: any };

type OutputType<T> = T extends [] ? (T extends Primitive[] ? T[] : Model<T>[]) : T extends Primitive ? T : Model<T>;

type Streams<T> = {
    [A in keyof T as `${string & A}$`]: Observable<OutputType<T[A]>>;
};
type Values<T> = {
    [A in keyof T]: OutputType<T[A]>;
};

type WithoutExport<T> = Values<T> & Streams<T>;
type WithExport<T> = WithoutExport<T> & {
    json$: Observable<string>;
};

export type Model<T> = WithoutExport<T> extends Excluded ? never : WithExport<T>;

export function model<A, B>(initial: Partial<A> = {}): UnaryFunction<Observable<A>, Observable<Model<B>>> {
    return pipe(
        map((input) => {
            const result: any = {};
            const streams: { [key: string]: Observable<any> } = {};

            Object.keys(input).map((key) => {
                const aKey = key as keyof A;
                const inputProperty = input[aKey];

                const [signal$, setSignal] = createSignal<any>();
                const middle$ = merge(signal$, of(inputProperty).pipe(handleImport(initial[aKey])));
                const [useSignal] = bind(middle$, initial[aKey]);

                result[`${key}$`] = middle$;

                switch (typeof inputProperty) {
                    case "object": {
                        if (Array.isArray(inputProperty))
                            streams[key] = middle$.pipe(
                                switchMap((array) =>
                                    combineLatest(
                                        array.map((value: any) => {
                                            switch (typeof value) {
                                                case "object": {
                                                    return value.json$;
                                                }
                                                default: {
                                                    return of(value);
                                                }
                                            }
                                        })
                                    )
                                )
                            );
                        else streams[key] = middle$.pipe(switchMap((x) => x.json$));
                        break;
                    }
                    default: {
                        streams[key] = middle$;
                        break;
                    }
                }

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

            result["json$"] = combineLatest(streams);

            return result as Model<B>;
        })
    );
}

export function createTopLevelModel<A, B>(stream$: Observable<A>, initial: Partial<A>): Model<B> {
    const result: any = {};
    const streams: { [key: string]: Observable<any> } = {};

    Object.keys(initial).map((key) => {
        const [signal$, setSignal] = createSignal<any>();
        const middle$ = merge(signal$, stream$.pipe(map((a) => a[key as keyof A])));

        const [useSignal] = bind(middle$, initial[key as keyof A]);

        result[`${key}$`] = middle$;
        streams[key] = middle$;
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

    result["json$"] = combineLatest(streams).pipe(map((obj) => JSON.stringify(obj)));

    return result as Model<B>;
}

function handleImport<A>(streams, initial: Partial<A> = {}): UnaryFunction<Observable<A>, Observable<any>> {
    return pipe(
        switchMap((value) => {
            switch (typeof value) {
                case "object": {
                    if (Array.isArray(value)) return forkJoin(value.map((i) => of(i).pipe(handleImport(initial))));

                    return of(value).pipe(model(initial));
                }
                default: {
                    return of(value);
                }
            }
        })
    );
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
