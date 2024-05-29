import { useEffect } from "react";
import type { Observable } from "rxjs";

/**
 * Attaches the given action to the given stream with the useEffect hook that unsubscribes when the component
 * is unmounted.
 *
 * @param stream$ The stream to subscribe the action to.
 * @param action The action that consumes the stream value.
 * @param deps The dependencies for the internal useEffect. Defaults to [].
 */
export function useSubscribe<T>(stream$: Observable<T>, action: (value: T) => void, deps: unknown[] = []) {
    useEffect(() => {
        const subscription = stream$.subscribe(action);
        return () => subscription.unsubscribe();
    }, [stream$, action, ...deps]);
}
