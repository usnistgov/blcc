import type { Observable } from "rxjs";
import type { PropsWithChildren } from "react";
import { createSignal } from "@react-rxjs/utils";
import Icon from "@mdi/react";

export enum ButtonType {
    PRIMARY = " bg-primary hover:bg-primary-light active:bg-primary-dark text-base-lightest ",
    PRIMARY_INVERTED = " bg-base-lightest hover:bg-base-lighter active:bg-base-light text-primary ",
    PRIMARY_DARK = " bg-primary-dark hover:bg-primary-light active:bg-primary-dark text-base-lightest ",
    ERROR = " bg-error hover:bg-error-light active:bg-error-dark text-base-lightest ",
    SUCCESS = " bg-success hover:bg-success-light active:bg-success-dark text-base-lightest ",
    DISABLED = " bg-base-lighter text-base-light ",
    LINK = " link text-primary hover:text-primary-light active:text-primary-dark text-base-lightest ",
    LINKERROR = " link text-error hover:text-error-light active:text-error-dark text-base-lightest "
}

export type ButtonProps = {
    className?: string;
    type?: ButtonType;
    icon?: string;
    disabled?: boolean;
    iconSide?: "left" | "right";
} & Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "type">;

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
            type = ButtonType.PRIMARY,
            icon,
            disabled = false,
            iconSide = "left",
            ...buttonProps
        }: PropsWithChildren & ButtonProps) => {
            return (
                <button
                    type={"button"}
                    className={
                        `${(className ? className : "")} ${disabled ? ButtonType.DISABLED : type} rounded px-2 py-1`
                    }
                    onClick={click}
                    disabled={disabled}
                    {...buttonProps}
                >
                    <span className={"flex flex-row place-items-center"}>
                        {icon && iconSide === "left" && <Icon className={"mr-1 min-w-[24px]"} path={icon} size={0.8} />}
                        {children}
                        {icon && iconSide === "right" && <Icon className={"ml-1"} path={icon} size={0.8} />}
                    </span>
                </button>
            );
        }
    };
}
