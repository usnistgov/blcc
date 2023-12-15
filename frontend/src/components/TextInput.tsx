import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Input, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { EMPTY, Observable } from "rxjs";

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
    label?: string;
};

export type TextInput = {
    onChange$: Observable<string>;
    component: React.FC<PropsWithChildren & TextInputProps>;
};

const { Title } = Typography;

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
            bordered = true,
            label
        }: PropsWithChildren & TextInputProps) => {
            return (
                <div>
                    <Title level={5}>{label}</Title>
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
                </div>
            );
        }
    };
}
