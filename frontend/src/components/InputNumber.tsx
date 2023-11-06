import { EMPTY, Observable } from "rxjs";
import React, { PropsWithChildren } from "react";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber } from "antd";
import { bind } from "@react-rxjs/core";

export type NumberInputProps = {
    className?: string;
    min?: number;
    max?: number;
    defaultValue?: number;
    after?: JSX.Element | string;
    before?: JSX.Element | string;
    controls: boolean;
};

export type NumberInput = {
    onChange$: Observable<number>;
    component: React.FC<PropsWithChildren & NumberInputProps>;
};

export default function textInput(value$: Observable<number | undefined> = EMPTY): NumberInput {
    const [onChange$, onChange] = createSignal<number>();
    const [useValue] = bind(value$, undefined);

    return {
        onChange$,
        component: ({
            children,
            className,
            min,
            max,
            defaultValue,
            after,
            before,
            controls
        }: PropsWithChildren & NumberInputProps) => {
            return (
                <InputNumber
                    className={className}
                    onChange={(value) => {
                        if (value !== null) onChange(value);
                    }}
                    value={useValue()}
                    min={min}
                    max={max}
                    defaultValue={defaultValue}
                    addonAfter={after}
                    addonBefore={before}
                    controls={controls}
                >
                    {children}
                </InputNumber>
            );
        }
    };
}
