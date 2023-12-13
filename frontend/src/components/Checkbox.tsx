import { createSignal } from "@react-rxjs/utils";
import { Checkbox } from "antd";
import React, { PropsWithChildren } from "react";
import { Observable } from "rxjs";

export type CheckboxProps = {
    className?: string;
    disabled?: boolean;
    defaultChecked?: boolean;
    checked?: boolean;
    key: number | string;
    value?: string;
};

export type CheckboxComp = {
    onChange$: Observable<boolean>;
    component: React.FC<PropsWithChildren<CheckboxProps>>;
};

/**
 * Creates a checkbox component and its associated change stream.
 */
export default function checkbox(): CheckboxComp {
    const [onChange$, onChange] = createSignal<boolean>();

    return {
        onChange$,
        component: ({
            children,
            className,
            disabled = false,
            defaultChecked = false,
            key,
            value
        }: PropsWithChildren & CheckboxProps) => {
            return (
                <Checkbox
                    onChange={(e) => onChange(e.target.checked)}
                    className={className}
                    disabled={disabled}
                    defaultChecked={defaultChecked}
                    key={key}
                >
                    {children}
                </Checkbox>
            );
        }
    };
}
