import React, { PropsWithChildren, ReactElement } from "react";
import { Alert } from "antd";
import Icon from "@mdi/react";
import button, { ButtonType } from "./Button";
import { mdiRefresh, mdiAlert } from "@mdi/js";

export type AlertProps = {
    onClick?: Function;
    action?: ReactElement;
};

export type Alert = {
    component: React.FC<PropsWithChildren & AlertProps>;
};

const { component: Button } = button();

export default function notification(): Alert {
    return {
        component: ({
            onClick = () => {
                console.log("Clicked"); // keep this until we use this in pages
            },
            action = (
                <Button type={ButtonType.PRIMARY_INVERTED} onClick={onClick} icon={mdiRefresh}>
                    Re Run
                </Button>
            )
        }: PropsWithChildren & AlertProps) => {
            return (
                <Alert
                    closable={true}
                    banner={true}
                    message={"Results are outdated! Run again to update result."}
                    type={"error"}
                    showIcon={true}
                    action={action}
                    icon={<Icon className={"mr-1"} path={mdiAlert} size={0.8} />}
                />
            );
        }
    };
}
