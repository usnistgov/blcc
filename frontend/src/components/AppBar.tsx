import React, {PropsWithChildren} from "react";

/**
 * Groups components for an app bar.
 */
export default function AppBar({children}: PropsWithChildren) {
    return <div className={"w-full h-fit min-h-12 bg-primary flex flex-row place-content-between"}>
        {children}
    </div>
}