import {useParams} from "react-router-dom";
import {useEffect} from "react";

export default function useModelParam(param: string, setValue: (value: string) => void) {
    const paramValue = useParams()[param];
    useEffect(() => {
        console.log(paramValue);

        if(paramValue !== undefined)
            setValue(paramValue)
    }, [paramValue]);
}