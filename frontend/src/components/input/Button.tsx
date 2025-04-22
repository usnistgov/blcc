import Icon from "@mdi/react";
import { Tooltip } from "antd";
import type { PropsWithChildren, ReactNode } from "react";
import type { Subject } from "rxjs";

export enum ButtonType {
    PRIMARY = " bg-primary hover:bg-primary-light active:bg-primary-dark text-base-lightest ",
    PRIMARY_INVERTED = " bg-base-lightest hover:bg-base-lighter active:bg-base-light text-primary ",
    PRIMARY_DARK = " bg-primary-dark hover:bg-primary-light active:bg-primary-dark text-base-lightest ",
    ERROR = " bg-error hover:bg-error-light active:bg-error-dark text-base-lightest ",
    SUCCESS = " bg-success hover:bg-success-light active:bg-success-dark text-base-lightest ",
    DISABLED = " bg-base-lighter text-base-light ",
    DISABLED_DARK = " bg-primary  text-primary-light ",
    DISABLED_LIGHT = " text-base-light ",
    LINK = " link text-primary hover:text-primary-light active:text-primary-dark text-base-lightest ",
    LINKERROR = " link text-error hover:text-error-light active:text-error-dark text-base-lightest ",
}

export type ButtonProps = {
    className?: string;
    type?: ButtonType;
    icon?: string;
    disabled?: boolean;
    disabledTheme?: "light" | "dark" | undefined;
    iconSide?: "left" | "right";
    wire?: Subject<void>;
    tooltip?: ReactNode;
    iconSize?: number;
} & Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "type">;

export function Button({
    children,
    className,
    type = ButtonType.PRIMARY,
    icon,
    disabled = false,
    disabledTheme,
    iconSide = "left",
    wire,
    tooltip,
    iconSize = 0.8,
    ...buttonProps
}: PropsWithChildren<ButtonProps>) {
    let theme = undefined;
    switch (disabledTheme) {
        case "light":
            theme = ButtonType.DISABLED_LIGHT;
            break;
        case "dark":
            theme = ButtonType.DISABLED_DARK;
            break;
        default:
            theme = ButtonType.DISABLED;
    }

    return (
        <Tooltip title={tooltip}>
            <button
                type={"button"}
                className={`${className ? className : ""} ${disabled ? theme : type} rounded px-2 py-1`}
                disabled={disabled}
                onClick={
                    wire
                        ? (e) => {
                              e.stopPropagation();
                              wire.next();
                          }
                        : undefined
                }
                {...buttonProps}
            >
                <span className={"flex flex-row place-items-center gap-x-1"}>
                    {icon && iconSide === "left" && <Icon className={"min-w-[24px]"} path={icon} size={iconSize} />}
                    {children}
                    {icon && iconSide === "right" && <Icon path={icon} size={iconSize} />}
                </span>
            </button>
        </Tooltip>
    );
}
