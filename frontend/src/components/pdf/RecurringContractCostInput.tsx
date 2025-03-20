import { View } from "@react-pdf/renderer";
import type { Project, RecurringContractCost } from "blcc-format/Format";
import {
    AnnualRateOfChange,
    CostName,
    CostSavings,
    Description,
    InitialCost,
    InitialOccurence,
    RateOfChangeValue,
    RateOfRecurrence,
    Recurring,
} from "components/pdf/components/CostComponents";

type RecurringContractCostInputProps = {
    cost: RecurringContractCost;
    year: number;
    project: Project;
};

export default function RecurringContractCostInput({ cost, year, project }: RecurringContractCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            <InitialOccurence cost={cost} />

            <CostSavings cost={cost} />

            <InitialCost cost={cost} />

            <AnnualRateOfChange cost={cost} project={project} />

            <Recurring cost={cost} />
            {cost.recurring ? (
                <>
                    <RateOfRecurrence cost={cost} year={year} />
                    <RateOfChangeValue cost={cost} year={year} project={project} />
                </>
            ) : null}
        </View>
    );
}
