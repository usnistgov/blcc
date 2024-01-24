import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { EMPTY, Observable } from "rxjs";
import { InputNumberProps } from "antd/es/input-number";

export type NumberInputProps = {
    label?: string;
} & InputNumberProps<number>;

export type NumberInput = {
    onChange$: Observable<number>;
    component: React.FC<PropsWithChildren & NumberInputProps>;
};

const { Title } = Typography;

export default function numberInput(value$: Observable<number | undefined> = EMPTY): NumberInput {
    const [onChange$, onChange] = createSignal<number>();
    const [useValue] = bind(value$, undefined);

    return {
        onChange$,
        component: ({ children, label, ...inputProps }: PropsWithChildren & NumberInputProps) => {
            const input = (
                <InputNumber
                    onChange={(value) => {
                        if (value !== null) onChange(value);
                    }}
                    value={useValue()}
                    {...inputProps}
                >
                    {children}
                </InputNumber>
            );

            return (
                (label !== undefined && (
                    <div>
                        <Title level={5}>{label}</Title>
                        {input}
                    </div>
                )) ||
                input
            );
        }
    };
}
