import { Outlet } from "react-router-dom";

export default function PageWrapper() {
    return (
        <div className={"w-full h-full bg-primary"}>
            <div
                className={
                    "w-full h-full overflow-y-auto rounded-tl bg-base-lightest border-t border-l border-base-light shadow-md"
                }
            >
                <Outlet />
            </div>
        </div>
    );
}
