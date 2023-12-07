import { createSignal } from "@react-rxjs/utils";
import { PropsWithChildren, useEffect } from "react";
import { Params, useParams } from "react-router-dom";

// add the type to createSignal
export const [siteId$, setSiteId] = createSignal<Params<string>>();

const ParamsComponent = ({ children }: PropsWithChildren) => {
    const params = useParams();

    useEffect(() => {
        // Use the 'params' object here as needed
        console.log("URL Params:", params);

        if (params !== undefined) setSiteId(params);
    }, [params]);

    return children;
};

export default ParamsComponent;
