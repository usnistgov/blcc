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
    return (
        <AntSwitch
            className={className}
            checked={useStateObservable(value$)}
            {...defaultProps}
        />
    );
}
