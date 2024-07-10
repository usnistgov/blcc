import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Switch as AntSwitch, type SwitchProps as AntSwitchProps } from "antd";
import { useEffect, useMemo } from "react";
import type { Observable, Subject } from "rxjs";

export type SwitchProps<Left, Right> = {
    left?: Left;
    right?: Right;
    value$?: Observable<Left | Right>;
    wire: Subject<Left | Right>;
    className?: string;
};

function getValue<LEFT, RIGHT>(internal$: Observable<LEFT | RIGHT>, value$?: Observable<LEFT | RIGHT>) {
    if (value$ === undefined) return internal$;

    return value$;
}

/**
 * Creates a switch component and its associated change stream.
 */
export default function Switch<Left = false, Right = true>({
    left = false as Left,
    right = true as Right,
    value$,
    wire,
    className,
    ...defaultProps
}: SwitchProps<Left, Right> & Omit<AntSwitchProps, "onChange" | "checked">) {
    // Set up the toggle subscription
    const [output$, toggle, internalState] = useMemo(() => {
        const [output$, toggle] = createSignal<Left | Right>();
        const [internalState] = bind(getValue(output$, value$), left);

        return [output$, toggle, internalState];
    }, [left, value$]);

    // Connect the toggle subscription to the output subject prop
    useEffect(() => {
        const sub = output$.subscribe(wire);
        return () => sub.unsubscribe();
    }, [wire, output$]);

    return (
        <AntSwitch
            className={className}
            checked={internalState() === right}
            onChange={(value) => (value ? toggle(right) : toggle(left))}
            {...defaultProps}
        />
    );
}
