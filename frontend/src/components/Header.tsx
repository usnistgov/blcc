import Title from "antd/es/typography/Title";
import type { PropsWithChildren } from "react";

type HeaderProps = {
    level?: 1 | 2 | 3 | 4 | 5;
};

export default function Header({ level = 5, children }: PropsWithChildren<HeaderProps>) {
    return (
        <div className={"mb-4 flex justify-between border-base-lightest border-b-2"}>
            <Title level={level}>{children}</Title>
        </div>
    );
}
