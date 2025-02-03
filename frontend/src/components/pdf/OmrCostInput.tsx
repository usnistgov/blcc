import { View } from "@react-pdf/renderer";
import type { OMRCost } from "blcc-format/Format";
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
    RateOfChangeUnits,
    RateOfChangeValue,
    RateOfRecurrence,
} from "components/pdf/CostComponents";

type OmrCostInputProps = {
    cost: OMRCost;
    year: number;
};

export default function OmrCostInput({ cost, year }: OmrCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            <CostSavings cost={cost} />

            <InitialCost cost={cost} />

            <InitialOccurence cost={cost} />

            <ExpectedLife cost={cost} />

            <AnnualRateOfChange cost={cost} />

            <CostAdjustmentFactor cost={cost} />

            {cost.recurring ? (
                <>
                    <RateOfRecurrence cost={cost} />
                    <RateOfChangeValue cost={cost} year={year} />
                    <RateOfChangeUnits cost={cost} year={year} />
                </>
            ) : null}
            <PhaseIn cost={cost} year={year} />
        </View>
    );
}
