import { Text, View } from "@react-pdf/renderer";
import type { ImplementationContractCost } from "blcc-format/Format";
import {
    AnnualRateOfChange,
    CostName,
    CostSavings,
    Description,
    InitialCost,
    InitialOccurence,
} from "./CostComponents";
import { styles } from "./styles/pdfStyles";
import { dollarFormatter } from "util/Util";

type ImplementationContractCostInputProps = {
    cost: ImplementationContractCost;
};

export default function ImplementationContractCostInput({ cost }: ImplementationContractCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            {cost.occurrence ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Occurrence:&nbsp;</Text>
                    <Text style={styles.value}>Year - {cost?.occurrence}</Text>
                </View>
            ) : null}

            <InitialOccurence cost={cost} />

            <CostSavings cost={cost} />

            {cost.cost ? (
                <View style={styles.key}>
                    {cost.costSavings ? (
                        <Text style={styles.text}>Savings:&nbsp;</Text>
                    ) : (
                        <Text style={styles.text}>Cost:&nbsp;</Text>
                    )}
                    <Text style={styles.value}>{dollarFormatter.format(cost?.cost)}</Text>
                </View>
            ) : null}

            <InitialCost cost={cost} />

            <AnnualRateOfChange cost={cost} />
        </View>
    );
}
