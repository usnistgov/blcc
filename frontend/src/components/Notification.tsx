import React, { PropsWithChildren, ReactElement } from "react";
import { Alert, Button } from "antd";
import Icon from "@mdi/react";

export type AlertProps = {
    banner?: boolean;
    btnText?: string;
    closable?: boolean;
    description?: string;
    icon?: string;
    message?: string;
    showIcon?: boolean;
    onClick?: Function;
    type: "warning" | "success" | "info" | "error";
    action?: ReactElement;
};

export type Alert = {
    component: React.FC<PropsWithChildren & AlertProps>;
};

export default function notification(): Alert {
    return {
        component: ({
            closable = true,
            banner = true,
            description,
            icon,
            type,
            message = `This is a ${type} notification`,
            showIcon = true,
            btnText = "ReRun",
            onClick = () => {
                console.log("Clicked"); // keep this until we use this in pages
            },
            action = (
                <Button size="small" type="text" onClick={onClick}>
                    {btnText}
                </Button>
            )
        }: PropsWithChildren & AlertProps) => {
            return (
                <Alert
                    closable={closable}
                    banner={banner}
                    description={description}
                    message={message}
                    type={type}
                    showIcon={showIcon}
                    action={action}
                    icon={icon ? <Icon className={"mr-1"} path={icon} size={0.8} /> : ""}
                />
            );
        }
    };
}
