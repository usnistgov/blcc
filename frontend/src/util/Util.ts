/* eslint @typescript-eslint/no-explicit-any: 0 */

import { firstValueFrom, merge, Observable } from "rxjs";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";

export type Streams<T> = {
    [A in keyof T as `${string & A}$`]: Observable<T[A]>;
};

export type Model<T> = T & Streams<T>;

export function createModel<A, B>(model: B): Model<A> {
    const result = {};

    const streams: any = {};

    Object.keys(model as object).map(async (key) => {
        const [signal$, setSignal] = createSignal<any>();
        const middle$ = merge(signal$, model[key as keyof B] as Observable<any>);
        streams[key] = middle$;

        const [useSignal] = bind(middle$, await firstValueFrom(model[key as keyof B] as Observable<any>));

        Object.defineProperty(result, `${key}$`, {
            value: middle$
        });
        Object.defineProperty(result, key, {
            get: function () {
                return useSignal();
            },
            set: function (value) {
                setSignal(value);
            },
            enumerable: true
        });
        Object.defineProperty(result, "toJson", {
            value: function () {}
        });
    });

    return result as Model<A>;
}
