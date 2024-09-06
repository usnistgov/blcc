import Icon from "@mdi/react";
import { Tooltip } from "antd";
import type { PropsWithChildren, ReactNode } from "react";
import { mdiHelpCircle } from "@mdi/js";

type InfoProps = {
    text: ReactNode;
};

/**
 * Displays the given text when hovering over the help icon.
 *
 * @param text The help text to display.
 * @param children
 */
export default function Info({ text, children }: PropsWithChildren<InfoProps>) {
    return (
        <div className={"flex flex-row gap-2 items-center"}>
            {children}
            <Tooltip title={text} className={"cursor-help"}>
                <Icon className={"text-base-light"} path={mdiHelpCircle} size={0.8} />
            </Tooltip>
        </div>
    );
}
