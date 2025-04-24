import { type StateObservable, bind } from "@react-rxjs/core";
import { type Effect, Match } from "effect";
import * as O from "optics-ts";
import { type Observable, Subject, distinctUntilChanged, map, scan, switchMap, BehaviorSubject, zip } from "rxjs";
import { shareReplay, startWith, tap, withLatestFrom } from "rxjs/operators";
import { ZodError, type ZodType } from "zod";
import type { Collection } from "dexie";
import { BlccRuntime } from "util/runtime";

export class DexieModel<T extends object> {
    private sModify$: Subject<(t: T) => T> = new Subject<(t: T) => T>();
    $: Observable<T>;

    constructor(getter$: Observable<T>, collection$: Observable<Collection<T>>) {
        this.$ = getter$.pipe(
            withLatestFrom(collection$),
            switchMap(([value, collection]) =>
                this.sModify$.pipe(
                    scan((acc, modifier) => modifier(acc), value),
                    tap((next) => {
                        console.log("Modifying from dexie model class", next);
                        collection.modify(next);
                    }),
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

export class Var<A extends object, B> {
    model: DexieModel<A>;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    optic: O.Lens<A, any, B> | O.Prism<A, any, B>;
    use: () => B;
    $: Observable<B>;
    change$: Subject<B>;
    schema?: ZodType;
    useValidation: () => ZodError | undefined;
    validation$: Observable<ZodError | undefined>;
    current$: BehaviorSubject<B>;

    constructor(
        model: DexieModel<A>,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        optic: O.Lens<A, any, B> | O.Prism<A, any, B>,
        schema: ZodType | undefined = undefined,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        validationEffects: ((b: B) => Effect.Effect<ZodError | undefined, never, any>)[] = [],
    ) {
        const get = getter(optic);

        const [hook, stream$] = bind(
            model.$.pipe(
                map((a) => get(a)),
                tap((b) => this.current$.next(b as B)),
                distinctUntilChanged(),
            ),
        );
        this.current$ = new BehaviorSubject(undefined as B);

        this.change$ = new Subject();
        this.model = model;
        this.optic = optic;
        // @ts-ignore
        this.use = hook;
        // @ts-ignore
        this.$ = stream$;
        this.schema = schema;
        const [useValidation, validation$] = bind(
            zip(
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
                stream$.pipe(
                    switchMap(async (value) => {
                        if (value === undefined) return undefined;

                        for (const func of validationEffects) {
                            const result = await func(value).pipe(BlccRuntime.runPromise);
                            console.log(result);

                            if (result !== undefined) return result;
                        }
                    }),
                ),
            ).pipe(
                map(([a, b]) => new ZodError([...(a?.issues ?? []), ...(b?.issues ?? [])])),
                map((errors) => (errors.issues.length === 0 ? undefined : errors)),
            ),
        );
        this.useValidation = useValidation;
        this.validation$ = validation$;
    }

    set(value: B) {
        this.model.modify((a) => O.set(this.optic)(value)(a));
        this.change$.next(value);
    }

    modify(mapper: (b: B) => B) {
        // @ts-ignore
        this.model.modify((a) => O.set(this.optic)(mapper(getter(this.optic)(a)))(a));
    }

    current() {
        return this.current$.getValue();
    }
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function getter<A, B>(optic: O.Lens<A, any, B> | O.Prism<A, any, B>) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return Match.type<O.Lens<A, any, B> | O.Prism<A, any, B>>().pipe(
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        Match.tag("Lens", (optic: O.Lens<A, any, B>) => (a: A) => O.get(optic)(a)),
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        Match.tag("Prism", (optic: O.Prism<A, any, B>) => (a: A) => O.preview(optic)(a)),
        Match.orElse(() => {
            throw new Error("Invalid optic type");
        }),
    )(optic);
}
