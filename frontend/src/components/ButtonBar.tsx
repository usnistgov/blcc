import {PropsWithChildren} from "react";

export type ButtonBarProps = {
    className?: string;
}

/**
 * Groups elements into a horizontal bar
 */
export default function ButtonBar({children, className}: PropsWithChildren & ButtonBarProps) {
    return <div className={(className ? className : "") + " flex flex-row gap-1"}>
        {children}
    </div>
}