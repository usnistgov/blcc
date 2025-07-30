import type { PropsWithChildren } from "react";

export type AppBarProps = {
    className?: string;
    type?: "header" | "footer";
};

/**
 * Groups components for an app bar.
 */
export default function AppBar({ children, className, type = "header" }: PropsWithChildren & AppBarProps) {
    return type === "header" ? (
        <header className={`${className ? className : ""} flex h-fit w-full flex-row place-content-between`}>
            {children}
        </header>
    ) : (
        <footer className={`${className ? className : ""} flex h-fit w-full flex-row place-content-between`}>
            {children}
        </footer>
    );
}

export function AppBarBetaTag() {
    return <span className="ml-2 text-white text-xs">BETA</span>;
}
