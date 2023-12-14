import { createSignal } from "@react-rxjs/utils";
import { PropsWithChildren, useEffect } from "react";
import { Params, useParams } from "react-router-dom";

export const [urlParameters$, setUrlParameters$] = createSignal<Params>();

export default function UrlParameters({ children }: PropsWithChildren) {
    const params = useParams();

    useEffect(() => {
        if (params !== undefined) setUrlParameters$(params);
    }, [params]);

    return <>{children}</>;
}
