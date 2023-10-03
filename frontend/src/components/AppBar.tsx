import React, { PropsWithChildren } from "react";

export type AppBarProps = {
    className?: string;
};

/**
 * Groups components for an app bar.
 */
export default function AppBar({ children, className }: PropsWithChildren & AppBarProps) {
    return (
        <div className={(className ? className : "") + " w-full h-fit min-h-12 flex flex-row place-content-between"}>
            {children}
        </div>
    );
}
