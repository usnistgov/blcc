import { Select } from "antd";
import Title from "antd/es/typography/Title";
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
    const optionSet = options();
    const valueSet = value();
    return (
        <div className={"mb-4 flex justify-between border-base-lightest border-b-2 pb-2"}>
            <Title level={5}>{children}</Title>
            {optionSet.length > 0 && (
                <Select className={"w-1/5"} onChange={onChange} options={optionSet} value={valueSet} />
            )}
        </div>
    );
}
