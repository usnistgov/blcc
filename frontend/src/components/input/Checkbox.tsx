import { createSignal } from "@react-rxjs/utils";
import { Checkbox } from "antd";
import type { PropsWithChildren } from "react";
import { EMPTY, type Observable } from "rxjs";
import { bind } from "@react-rxjs/core";

export type CheckboxProps = {
    className?: string;
    disabled?: boolean;
    defaultChecked?: boolean;
    checked?: boolean;
};

export type CheckboxComp = {
    onChange$: Observable<boolean>;
    component: React.FC<PropsWithChildren<CheckboxProps>>;
};

/**
 * Creates a checkbox component and its associated change stream.
 */
export default function checkbox(value$: Observable<boolean> = EMPTY): CheckboxComp {
    const [onChange$, onChange] = createSignal<boolean>();
    const [useValue] = bind(value$, false);

    return {
        onChange$,
        component: ({
            children,
            className,
            disabled = false,
            defaultChecked = false
        }: PropsWithChildren & CheckboxProps) => {
            return (
                <Checkbox
                    onChange={(e) => onChange(e.target.checked)}
                    className={className}
                    disabled={disabled}
                    defaultChecked={defaultChecked}
                    value={useValue()}
                >
                    {children}
                </Checkbox>
            );
        }
    };
}
