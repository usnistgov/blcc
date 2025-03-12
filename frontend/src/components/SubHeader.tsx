import type { PropsWithChildren } from "react";

export default function SubHeader({ children }: PropsWithChildren) {
    return (
        <div className={"flex flex-col border-base-lighter border-b-2 bg-base-lightest py-2 shadow-md"}>{children}</div>
    );
}
