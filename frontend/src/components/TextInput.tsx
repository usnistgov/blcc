import { Observable } from "rxjs";
import React, { PropsWithChildren } from "react";
import { createSignal } from "@react-rxjs/utils";
import { Input } from "antd";

export enum TextInputType {
    PRIMARY = " border-solid border-2 border-black hover:border-black active:border-black ",
    ERROR = " border-solid border-2 border-red-600 active:border-red-600 hover:border-red-600 ",
    SUCCESS = " border-solid border-2 border-green-600 active:border-green-600 hover:border-green-600 ",
    DISABLED = " bg-base-lighter text-base-light "
}

export type TextInputProps = {
    className?: string;
    type: TextInputType;
    disabled?: boolean;
    placeholder?: string;
    bordered?: boolean;
};

export type TextInput = {
    onChange$: Observable<string>;
    component: (props: PropsWithChildren & TextInputProps) => React.JSX.Element;
};

export default function textInput(): TextInput {
    const [onChange$, onChange] = createSignal<string>();

    return {
        onChange$,
        component: ({
            children,
            className,
            type,
            disabled = false,
            bordered = true,
            placeholder
        }: PropsWithChildren & TextInputProps) => {
            return (
                <Input
                    className={(className ?? "") + `${disabled ? TextInputType.DISABLED : type} w-44`}
                    onChange={(event) => event.target.value}
                    placeholder={placeholder}
                    bordered={bordered}
                    disabled={disabled}
                >
                    {children}
                </Input>
            );
        }
    };
}
