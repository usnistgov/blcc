import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { InputNumber, Typography } from "antd";
import React, { PropsWithChildren } from "react";
import { EMPTY, Observable } from "rxjs";

export type NumberInputProps = {
    className?: string;
    min?: number;
    max?: number;
    defaultValue?: number;
    after?: JSX.Element | string;
    before?: JSX.Element | string;
    controls: boolean;
    label?: string;
};

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
        component: ({
            children,
            className,
            min,
            max,
            defaultValue,
            after,
            before,
            controls,
            label
        }: PropsWithChildren & NumberInputProps) => {
            return (
                <>
                    <Title level={5}>{label}</Title>
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
                </>
            );
        }
    };
}
