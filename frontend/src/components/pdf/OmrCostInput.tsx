import { View } from "@react-pdf/renderer";
import type { OMRCost, Project } from "blcc-format/Format";
import {
    CostName,
    CostSavings,
    Description,
    InitialCost,
    InitialOccurence,
    RateOfChangeUnits,
    RateOfChangeValue,
    RateOfRecurrence,
} from "components/pdf/components/CostComponents";

type OmrCostInputProps = {
    cost: OMRCost;
    year: number;
    project: Project;
};

export default function OmrCostInput({ cost, year, project }: OmrCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            <CostSavings cost={cost} />

            <InitialCost cost={cost} />

            <InitialOccurence cost={cost} />

            {cost.recurring ? (
                <>
                    <RateOfRecurrence cost={cost} />
                    <RateOfChangeValue cost={cost} year={year} project={project} />
                    <RateOfChangeUnits cost={cost} year={year} />
                </>
            ) : (
                <></>
            )}
        </View>
    );
}
