import React from "react";
import { Outlet } from "react-router-dom";

export default function Navigation() {
    return (
        <>
            <div className={"w-fit h-full bg-base-light"}>Navigation</div>
            <Outlet />
        </>
    );
}
