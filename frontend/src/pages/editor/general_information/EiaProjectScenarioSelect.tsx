import Title from "antd/es/typography/Title";
import Nbsp from "util/Nbsp";
import { Select } from "antd";
import { Case } from "blcc-format/Format";
import { Model } from "model/Model";
import { useStateObservable } from "@react-rxjs/core";

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
    const eiaCase = useStateObservable(Model.case$);

    return (
        <div>
            <Title level={5}>
                EIA Projection Scenario
                <Nbsp />*
            </Title>
            <Select
                className={"w-full"}
                options={CaseOptions}
                onSelect={(select) => Model.sCase$.next(select)}
                value={eiaCase}
            />
        </div>
    );
}
