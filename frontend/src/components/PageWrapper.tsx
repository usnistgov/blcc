import { Outlet } from "react-router-dom";

/**
 * Wraps the main page contents in default styling and layout.
 */
export default function PageWrapper() {
    return (
        <div className={"h-full w-full bg-off-white"}>
            <div className={"h-full w-full overflow-y-auto rounded-tl border-l border-t border-base-light shadow-md"}>
                <Outlet />
            </div>
        </div>
    );
}
