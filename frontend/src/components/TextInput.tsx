import { EMPTY, Observable } from "rxjs";
import React, { PropsWithChildren } from "react";
import { createSignal } from "@react-rxjs/utils";
import { Input } from "antd";
import { bind } from "@react-rxjs/core";

export enum TextInputType {
    PRIMARY = " ",
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
    component: React.FC<PropsWithChildren & TextInputProps>;
};

export default function textInput(
    value$: Observable<string | undefined> = EMPTY,
    placeholder$: Observable<string> = EMPTY
): TextInput {
    const [onChange$, onChange] = createSignal<string>();
    const [usePlaceholder] = bind(placeholder$, undefined);
    const [useValue] = bind(value$, undefined);

    return {
        onChange$,
        component: ({
            children,
            className,
            type,
            disabled = false,
            bordered = true
        }: PropsWithChildren & TextInputProps) => {
            return (
                <Input
                    className={(className ?? "") + `${disabled ? TextInputType.DISABLED : type}`}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={usePlaceholder()}
                    bordered={bordered}
                    disabled={disabled}
                    value={useValue()}
                >
                    {children}
                </Input>
            );
        }
    };
}
