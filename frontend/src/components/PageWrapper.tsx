import { Outlet } from "react-router-dom";

export default function PageWrapper() {
    return (
        <div className={"bg-off-white h-full w-full"}>
            <div className={"h-full w-full overflow-y-auto rounded-tl border-l border-t border-base-light shadow-md"}>
                <Outlet />
            </div>
        </div>
    );
}
