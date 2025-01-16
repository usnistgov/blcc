import { Select } from "antd";
import Title from "antd/es/typography/Title";
import { Case } from "blcc-format/Format";
import { Model } from "model/Model";
import Nbsp from "util/Nbsp";

const CaseOptions = [
    {
        value: Case.REF,
        label: "Reference",
    },
    {
        value: Case.LOWZTC,
        label: "Low Zero-Carbon Technology Cost",
    },
];

/**
 * Select component for EIA Projection Scenario Case.
 */
export function EiaProjectScenarioSelect() {
    return (
        <div>
            <Title level={5}>
                EIA Projection Scenario
                <Nbsp />*
            </Title>
            <Select
                className={"w-full"}
                options={CaseOptions}
                onSelect={(select) => Model.eiaCase.set(select)}
                value={Model.eiaCase.use()}
            />
        </div>
    );
}
