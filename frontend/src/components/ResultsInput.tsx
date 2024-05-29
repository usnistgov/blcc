/**
 * Creates a common component to display data for the Input page.
 */
import { Typography } from "antd";

const { Title } = Typography;

export type InputProps = {
    label: string;
    dataVal: string | number | undefined;
};

export default function ResultsInput(props: InputProps) {
    const { label, dataVal = "NA" } = props;

    return (
        <div className="pb-3">
            <Title level={5}>{label}</Title>
            {dataVal === "NA" ? <h2 className="text-base-light">NA</h2> : <h2>{dataVal}</h2>}
        </div>
    );
}
