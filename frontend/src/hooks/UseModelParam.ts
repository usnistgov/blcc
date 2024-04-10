import { useParams } from "react-router-dom";
import { useEffect } from "react";

/**
 * Watches the react-router URL and pushes URL parameters to the provided callback.
 *
 * @param param The name of the URL parameter.
 * @param setValue The callback that consumes the value.
 */
export default function useModelParam(param: string, setValue: (value: string) => void) {
    const paramValue = useParams()[param];
    useEffect(() => {
        if (paramValue !== undefined)
            setValue(paramValue)
    }, [paramValue, setValue]);
}
