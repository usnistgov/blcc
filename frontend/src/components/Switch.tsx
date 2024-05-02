import { type Observable, of, Observer } from "rxjs";
import { useEffect, type PropsWithChildren, type ReactNode } from "react";
import { createSignal } from "@react-rxjs/utils";
import { Switch } from "antd";
import { StateObservable, bind, useStateObservable } from "@react-rxjs/core";
import { Rxjs } from "../util/Util";

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
export default function switchComp(value$: Observable<boolean> = of(false)): SwitchComp {
    const [onChange$, onChange] = createSignal<boolean>();
    const [value] = bind(value$, false);

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
                    checked={value()}
                    defaultChecked={defaultChecked}
                    checkedChildren={checkedChildren}
                    unCheckedChildren={unCheckedChildren}
                />
            );
        }
    };
}

export const RxjsSwitch = Rxjs<{ toggle$: Observable<boolean>, toggle: (x: boolean) => void }, { value$: StateObservable<boolean>, callback: Observer<boolean> }>(
    () => {
        const [toggle$, toggle] = createSignal<boolean>();
        return {
            toggle$,
            toggle
        }
    },
    ({ toggle$, toggle, value$, callback }) => {
        const value = useStateObservable(value$);

        useEffect(() => {
            toggle$.subscribe((t) => callback.next(t))
        }, [toggle$, callback]);

        return <Switch onChange={toggle} value={value} />
    }
)
