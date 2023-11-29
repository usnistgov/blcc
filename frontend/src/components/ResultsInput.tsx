/**
 * Creates a common component to display data for the Input page.
 */
import { Typography } from "antd";
import React, { PropsWithChildren } from "react";

const { Title } = Typography;

export type InputProps = {
    className?: string;
    label: string;
    dataVal: string | number;
};

export type ResultsInput = {
    component: React.FC<PropsWithChildren & InputProps>;
};

export default function resultsInput() {
    return {
        component: ({ className = "", label = "", dataVal = "NA" }: PropsWithChildren & InputProps) => {
            return (
                <div className={className + "pb-3"}>
                    <Title level={5}>{label}</Title>
                    {dataVal === "NA" ? <h2 className="text-base-light">NA</h2> : <h2>{dataVal}</h2>}
                </div>
            );
        }
    };
}
