import { Observable } from "rxjs";
import React, { PropsWithChildren } from "react";
import { createSignal } from "@react-rxjs/utils";
import Icon from "@mdi/react";

export enum ButtonType {
    PRIMARY = " bg-primary hover:bg-primary-light active:bg-primary-dark text-base-lightest ",
    PRIMARY_INVERTED = " bg-base-lightest hover:bg-base-lighter active:bg-base-light text-primary ",
    ERROR = " bg-error hover:bg-error-light active:bg-error-dark text-base-lightest ",
    SUCCESS = " bg-success hover:bg-success-light active:bg-success-dark text-base-lightest ",
    DISABLED = " bg-base-lighter text-base-light "
}

export type ButtonProps = {
    className?: string;
    type: ButtonType;
    icon?: string;
    disabled?: boolean;
    iconSide?: "left" | "right";
};

export type Button = {
    click$: Observable<void>;
    component: (props: PropsWithChildren & ButtonProps) => React.JSX.Element;
};

/**
 * Creates a button component and its associated click stream.
 */
export default function button(): Button {
    const [click$, click] = createSignal();

    return {
        click$: click$,
        component: ({
            children,
            className,
            type,
            icon,
            disabled = false,
            iconSide = "right"
        }: PropsWithChildren & ButtonProps) => {
            return (
                <button
                    className={
                        (className ? className : "") + ` ${disabled ? ButtonType.DISABLED : type} py-1 px-2 rounded`
                    }
                    onClick={click}
                    disabled={disabled}
                >
                    <span className={"flex flex-row place-items-center"}>
                        {icon && iconSide === "left" && <Icon className={"mr-1"} path={icon} size={0.8} />}
                        {children}
                        {icon && iconSide === "right" && <Icon className={"ml-1"} path={icon} size={0.8} />}
                    </span>
                </button>
            );
        }
    };
}
