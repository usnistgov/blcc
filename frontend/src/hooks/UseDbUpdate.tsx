import { Observable } from "rxjs";
import { Collection } from "dexie";
import { useEffect } from "react";
import { withLatestFrom } from "rxjs/operators";

export function useDbUpdate<A, B extends keyof A>(
    stream$: Observable<A[B]>,
    dbObj$: Observable<Collection<A>>,
    param: keyof A
) {
    useEffect(() => {
        const subscription = stream$.pipe(withLatestFrom(dbObj$)).subscribe(([value, db]) => {
            if (value === undefined) {
                db.modify((v) => {
                    delete v[param];
                    return v;
                });
            }

            db.modify({ [param]: value });
        });
        return () => subscription.unsubscribe();
    }, []);
}
