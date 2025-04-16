import { View } from "@react-pdf/renderer";
import type { ImplementationContractCost, Project } from "blcc-format/Format";
import {
    AnnualRateOfChange,
    CostName,
    CostSavings,
    Description,
    InitialCost,
    InitialOccurence,
    ValueRateOfChange,
} from "./components/CostComponents";
import { dollarFormatter } from "util/Util";
import { LabeledText } from "./components/GeneralComponents";

type ImplementationContractCostInputProps = {
    cost: ImplementationContractCost;
    project: Project;
};

export default function ImplementationContractCostInput({ cost, project }: ImplementationContractCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            {cost.initialOccurrence ? (
                <LabeledText label="Occurrence" text={`Year - ${cost?.initialOccurrence}`} />
            ) : null}

            <InitialOccurence cost={cost} />

            <CostSavings cost={cost} />

            {cost.cost ? (
                <LabeledText label={cost.costSavings ? "Savings" : "Cost"} text={dollarFormatter.format(cost?.cost)} />
            ) : null}

            <InitialCost cost={cost} />

            <ValueRateOfChange cost={cost} project={project} />
        </View>
    );
}
