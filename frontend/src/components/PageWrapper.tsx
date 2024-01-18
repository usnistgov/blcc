import { Outlet } from "react-router-dom";

export default function PageWrapper() {
    return (
        <div className={"h-full w-full bg-primary"}>
            <div
                className={
                    "h-full w-full overflow-y-auto rounded-tl border-l border-t border-base-light bg-base-lightest shadow-md"
                }
            >
                <Outlet />
            </div>
        </div>
    );
}
