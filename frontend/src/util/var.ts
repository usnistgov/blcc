import { type StateObservable, bind } from "@react-rxjs/core";
import * as O from "optics-ts";
import { type Observable, Subject, distinctUntilChanged, map, scan, switchMap } from "rxjs";
import { shareReplay, startWith } from "rxjs/operators";
import { match } from "ts-pattern";
import type { ZodError, ZodType } from "zod";

export class DexieModel<T> {
    private sModify$: Subject<(t: T) => T> = new Subject<(t: T) => T>();
    $: Observable<T>;

    constructor(getter$: Observable<T>) {
        this.$ = getter$.pipe(
            switchMap((value) =>
                this.sModify$.pipe(
                    scan((acc, modifier) => modifier(acc), value),
                    startWith(value),
                ),
            ),
            shareReplay(1),
        );
    }

    modify(modifier: (t: T) => T) {
        this.sModify$.next(modifier);
    }
}

export class ModelType<A> {
    subject: Subject<A> = new Subject<A>();
    use: () => A;
    $: StateObservable<A>;

    constructor() {
        const [hook, stream$] = bind(this.subject);

        this.use = hook;
        this.$ = stream$;
    }
}

export class Var<A, B> {
    model: DexieModel<A>;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    optic: O.Lens<A, any, B> | O.Prism<A, any, B>;
    use: () => B;
    $: Observable<B>;
    schema?: ZodType;
    useValidation: () => ZodError | undefined;
    validation$: Observable<ZodError | undefined>;

    constructor(
        model: DexieModel<A>,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        optic: O.Lens<A, any, B> | O.Prism<A, any, B>,
        schema: ZodType | undefined = undefined,
    ) {
        const getter = match(optic)
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .with({ _tag: "Lens" }, (optic: O.Lens<A, any, B>) => (a: A) => O.get(optic)(a))
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .with({ _tag: "Prism" }, (optic: O.Prism<A, any, B>) => (a: A) => O.preview(optic)(a))
            .otherwise(() => {
                throw new Error("Invalid optic type");
            });

        const [hook, stream$] = bind(
            model.$.pipe(
                map((a) => getter(a)),
                distinctUntilChanged(),
            ),
        );

        this.model = model;
        this.optic = optic;
        // @ts-ignore
        this.use = hook;
        // @ts-ignore
        this.$ = stream$;
        this.schema = schema;
        const [useValidation, validation$] = bind(
            stream$.pipe(
                map((value) => {
                    try {
                        schema?.parse(value);
                        return undefined;
                    } catch (e) {
                        return e as ZodError;
                    }
                }),
            ),
        );
        this.useValidation = useValidation;
        this.validation$ = validation$;
    }

    set(value: B) {
        this.model.modify((a) => O.set(this.optic)(value)(a));
    }

    modify(mapper: (b: B) => B) {
        const optic = this.optic;
        const getter = match(optic)
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .with({ _tag: "Lens" }, (optic: O.Lens<A, any, B>) => (a: A) => O.get(optic)(a))
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .with({ _tag: "Prism" }, (optic: O.Prism<A, any, B>) => (a: A) => O.preview(optic)(a))
            .otherwise(() => {
                throw new Error("Invalid optic type");
            });
        // @ts-ignore
        this.model.modify((a) => O.set(optic)(mapper(getter(a)))(a));
    }

    remove() {
        match(this.optic)
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            .with({ _tag: "Prism" }, (optic: O.Prism<A, any, B>) => this.model.modify((a) => O.remove(optic)(a)))
            .otherwise(() => {});
    }
}
