import {Observable} from "rxjs";
import React, {PropsWithChildren} from "react";
import {createSignal} from "@react-rxjs/utils";
import Icon from "@mdi/react";

export enum ButtonType {
    PRIMARY = " bg-primary hover:bg-primary-light active:bg-primary-dark ",
    CANCEL = " bg-cancel ",
    ACCEPT = " bg-accept "
}

export type ButtonProps = {
    className?: string;
    type: ButtonType;
    inverted?: boolean;
    textOnly?: boolean;
    icon?: string;
    iconSide?: "left" | "right";
}

export type Button = {
    click$: Observable<void>;
    component: (props: PropsWithChildren & ButtonProps) => React.JSX.Element;
}

function getColor() {

}

/**
 * Creates a button component and its associated click stream.
 */
export default function button(): Button {
    const [click$, click] = createSignal();

    return {
        click$: click$,
        component: ({children, className, inverted, type, textOnly, icon, iconSide = "right"}: PropsWithChildren & ButtonProps) => {
            //TODO: Add styling
            const background = inverted ? "bg-white" : type;
            const textColor = inverted ? "text-primary" : "text-white";

            return <button className={(className ? className : "") + ` ${background} ${textColor} py-1 px-2 rounded`}
                           onClick={click}>
                <span className={"flex flex-row place-items-center"}>
                    {icon && iconSide === "left" && <Icon className={"mr-1"} path={icon} size={0.8}/>}
                    {children}
                    {icon && iconSide === "right" && <Icon className={"ml-1"} path={icon} size={0.8}/>}
                </span>
            </button>
        }
    }
}