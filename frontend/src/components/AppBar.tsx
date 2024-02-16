import React, { PropsWithChildren } from "react";

export type AppBarProps = {
    className?: string;
};

/**
 * Groups components for an app bar.
 */
export default function AppBar({ children, className }: PropsWithChildren & AppBarProps) {
    return (
        <div className={(className ? className : "") + " flex h-fit w-full flex-row place-content-between"}>
            {children}
        </div>
    );
}
