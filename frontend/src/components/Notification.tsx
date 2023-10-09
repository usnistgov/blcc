import React, { PropsWithChildren, ReactElement } from "react";
import { createSignal } from "@react-rxjs/utils";
import { Observable } from "rxjs";
import { Alert } from "antd";
import Icon from "@mdi/react";
import button, { ButtonType } from "./Button";
import { mdiRefresh, mdiAlert } from "@mdi/js";

export type AlertProps = {
    action?: ReactElement;
};

export type Alert = {
    $click: Observable<void>;
    component: React.FC<PropsWithChildren & AlertProps>;
};

const { component: Button } = button();

export default function notification(): Alert {
    const [$click, click] = createSignal();
    return {
        $click,
        component: ({
            action = (
                <Button type={ButtonType.PRIMARY_INVERTED} onClick={click} icon={mdiRefresh}>
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
