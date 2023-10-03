import {Observable} from "rxjs";
import React, {PropsWithChildren} from "react";
import {createSignal} from "@react-rxjs/utils";
import Icon from "@mdi/react";

export enum TextInputType {
    PRIMARY = "w-44",
    PRIMARY_INVERTED = " bg-base-lightest hover:bg-base-lighter active:bg-base-light text-primary ",
    ERROR = " bg-error hover:bg-error-light active:bg-error-dark text-base-lightest ",
    SUCCESS = " bg-success hover:bg-success-light active:bg-success-dark text-base-lightest ",
    DISABLED = " bg-base-lighter text-base-light "
}


export type TextInputProps = {
    className?: string;
    type: TextInputType;
    icon?: string;
    disabled?: boolean
}

export type TextInput = {
    onChange$: Observable<void>;
    component: (props: PropsWithChildren & TextInputProps) => React.JSX.Element;
}

export default function textInput(): TextInput {
    const [onChange$, onChange] = createSignal()

    return {
        onChange$,
        component: ({
                children,
                className,
                type,
                icon,
                disabled = false,
            }: PropsWithChildren & TextInputProps) => {
                return <input className={(className ?? "") + ` ${disabled ? TextInputType.DISABLED : type}`} 
                onChange={onChange}>
                    {children}
                </input>
            }
        }
}