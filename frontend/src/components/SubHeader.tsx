import { PropsWithChildren } from "react";

export default function SubHeader({ children }: PropsWithChildren) {
    return <div className={"flex flex-col border-b-2 border-base-lighter bg-base-lightest py-2"}>{children}</div>;
}
