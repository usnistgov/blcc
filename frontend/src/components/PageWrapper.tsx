import { Outlet } from "react-router-dom";

/**
 * Wraps the main page contents in default styling and layout.
 */
export default function PageWrapper() {
    return (
        <div className={"h-full w-full bg-off-white"}>
            <Outlet />
        </div>
    );
}
