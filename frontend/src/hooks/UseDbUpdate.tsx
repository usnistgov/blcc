import type { Observable } from "rxjs";
import type { Collection } from "dexie";
import { useEffect } from "react";
import { withLatestFrom } from "rxjs/operators";

export function useDbUpdate<A, B extends keyof A>(
    stream$: Observable<A[B]>,
    dbObj$: Observable<Collection<A>>,
    param: string
) {
    useEffect(() => {
        const subscription = stream$.pipe(withLatestFrom(dbObj$)).subscribe(([value, db]) => {
            if (value === undefined) {
                db.modify((v) => {
                    // Param should be keyof A, but we can't use that since we can use x.y for property access
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    delete v[param];
                    return v;
                });
            }

            db.modify({ [param]: value });
        });
        return () => subscription.unsubscribe();
    }, [stream$, dbObj$, param]);
}
