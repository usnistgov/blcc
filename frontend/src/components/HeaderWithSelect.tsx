import { Select } from "antd";
import Title from "antd/es/typography/Title";
import { ResultModel } from "model/ResultModel";
import type { PropsWithChildren } from "react";

type HeaderProps = {
    // Method to run when selection changes
    onChange: (payload: string) => void;
    // Dropdown options
    options: () => { value: string; label: string }[];
    // Currently selected option
    value: () => string;
};

export default function HeaderWithSelect({ onChange, options, value, children }: PropsWithChildren<HeaderProps>) {
    return (
        <div className={"mb-4 pb-2 flex justify-between border-b-2 border-base-lightest"}>
            <Title level={5}>{children}</Title>
            <Select className={"w-1/5"} onChange={onChange} options={options()} value={value()} />
        </div>
    );
}
