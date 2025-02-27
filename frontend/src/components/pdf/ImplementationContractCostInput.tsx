import { Text, View } from "@react-pdf/renderer";
import type { ImplementationContractCost } from "blcc-format/Format";
import {
    AnnualRateOfChange,
    CostName,
    CostSavings,
    Description,
    InitialCost,
    InitialOccurence,
} from "./components/CostComponents";
import { styles } from "./pdfStyles";
import { dollarFormatter } from "util/Util";
import { LabeledText } from "./components/GeneralComponents";

type ImplementationContractCostInputProps = {
    cost: ImplementationContractCost;
};

export default function ImplementationContractCostInput({ cost }: ImplementationContractCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            {cost.occurrence ? <LabeledText label="Occurrence" text={`Year - ${cost?.occurrence}`} /> : null}

            <InitialOccurence cost={cost} />

            <CostSavings cost={cost} />

            {cost.cost ? (
                <LabeledText label={cost.costSavings ? "Savings" : "Cost"} text={dollarFormatter.format(cost?.cost)} />
            ) : null}

            <InitialCost cost={cost} />

            <AnnualRateOfChange cost={cost} />
        </View>
    );
}
