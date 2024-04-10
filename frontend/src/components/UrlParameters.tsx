import { createSignal } from "@react-rxjs/utils";
import { type PropsWithChildren, useEffect } from "react";
import { type Params, useParams } from "react-router-dom";

/**
 * A stream that represents the URL parameters.
 */
export const [urlParameters$, setUrlParameters$] = createSignal<Params>();

/**
 * Creates a component that pushes the URL parameters into a stream.
 */
export default function UrlParameters({ children }: PropsWithChildren) {
    const params = useParams();

    useEffect(() => {
        if (params !== undefined) setUrlParameters$(params);
    }, [params]);

    return <>{children}</>;
}
