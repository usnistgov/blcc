import { Switch as AntSwitch, SwitchProps as AntSwitchProps } from "antd";
import { StateObservable, useStateObservable } from "@react-rxjs/core";

export type SwitchProps = {
    value$: StateObservable<boolean>,
    className?: string;
};

/**
 * Creates a switch component and its associated change stream.
 */
export default function Switch(
    {
        value$,
        className,
        ...defaultProps
    }: SwitchProps & AntSwitchProps
) {
    const value = useStateObservable(value$);

    return (
        <AntSwitch
            className={className}
            checked={value}
            {...defaultProps}
        />
    );
}
