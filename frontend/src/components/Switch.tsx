import { Observable } from "rxjs";
import React, { PropsWithChildren } from "react";
import { createSignal } from "@react-rxjs/utils";
import { Switch } from "antd";

export type SwitchProps = {
    className?: string;
    disabled?: boolean;
    defaultChecked?: boolean;
    checked?: boolean;
    checkedChildren?: React.ReactNode;
    unCheckedChildren?: React.ReactNode;
};

export type SwitchComp = {
    onChange$: Observable<boolean>;
    component: React.FC<PropsWithChildren & SwitchProps>;
};

/**
 * Creates a switch component and its associated change stream.
 */
export default function switchComp(): SwitchComp {
    const [onChange$, onChange] = createSignal<boolean>();

    return {
        onChange$,
        component: ({
            className,
            disabled = false,
            defaultChecked = true,
            checkedChildren,
            unCheckedChildren
        }: PropsWithChildren & SwitchProps) => {
            return (
                <Switch
                    className={className}
                    onChange={onChange}
                    disabled={disabled}
                    defaultChecked={defaultChecked}
                    checkedChildren={checkedChildren}
                    unCheckedChildren={unCheckedChildren}
                />
            );
        }
    };
}
