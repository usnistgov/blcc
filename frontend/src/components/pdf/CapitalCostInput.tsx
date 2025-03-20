import { View } from "@react-pdf/renderer";
import type { CapitalCost, Project } from "blcc-format/Format";
import {
    AnnualRateOfChange,
    CostAdjustmentFactor,
    CostName,
    CostSavings,
    Description,
    ExpectedLife,
    InitialCost,
    InitialOccurence,
    PhaseIn,
} from "./components/CostComponents";
import { dollarFormatter } from "util/Util";
import ResidualValue from "./ResidualValue";
import { LabeledText } from "./components/GeneralComponents";

type CapitalCostInputProps = {
    cost: CapitalCost;
    year: number;
    project: Project;
};

export default function CapitalCostInput({ cost, year, project }: CapitalCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            <CostSavings cost={cost} />

            <InitialCost cost={cost} />

            <InitialOccurence cost={cost} />

            {cost?.amountFinanced ? (
                <LabeledText label="Amount Financed:" text={dollarFormatter.format(cost?.amountFinanced)} />
            ) : null}

            <ExpectedLife cost={cost} />

            <AnnualRateOfChange cost={cost} project={project} />

            <CostAdjustmentFactor cost={cost} project={project} />

            <LabeledText label="Residual Value" text={cost?.residualValue ? "Yes" : "No"} />

            {cost?.residualValue ? (
                <ResidualValue residualValue={cost?.residualValue.value} approach={cost.residualValue.approach} />
            ) : null}

            <PhaseIn cost={cost} year={year} />
        </View>
    );
}
