import Title from "antd/es/typography/Title";
import React, { PropsWithChildren } from "react";

export default function Header({ children }: PropsWithChildren) {
    return (
        <div className={"mb-4 flex justify-between border-b-2 border-base-lightest"}>
            <Title level={5}>{children}</Title>
        </div>
    );
}
