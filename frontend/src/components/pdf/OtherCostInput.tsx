import { Text, View } from "@react-pdf/renderer";
import {
    CostName,
    Description,
    InitialOccurence,
    RateOfChangeUnits,
    RateOfChangeValue,
    RateOfRecurrence,
    Recurring,
} from "./CostComponents";

import type { OtherCost } from "blcc-format/Format";
import { styles } from "./pdfStyles";

type OtherCostInputProps = {
    cost: OtherCost;
    year: number;
};

export default function OtherCostInput({ cost, year }: OtherCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />

            <Description cost={cost} />

            {cost?.tags ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Tags:&nbsp;</Text>
                    {cost?.tags?.map((tag: string) => (
                        <Text key={tag} style={styles.tag}>
                            {tag}
                        </Text>
                    ))}
                </View>
            ) : null}

            {cost?.costOrBenefit ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Cost or Benefit:&nbsp;</Text>
                    <Text style={styles.value}>{cost?.costOrBenefit}</Text>
                </View>
            ) : null}

            <InitialOccurence cost={cost} />

            {cost?.valuePerUnit ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Value per Unit:&nbsp;</Text>
                    <Text style={styles.value}>
                        {cost?.valuePerUnit} per {cost?.unit}
                    </Text>
                </View>
            ) : null}

            {cost?.numberOfUnits ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Number Of Units:&nbsp;</Text>
                    <Text style={styles.value}>
                        {cost?.numberOfUnits} {cost?.unit}
                    </Text>
                </View>
            ) : null}

            <Recurring cost={cost} />

            {cost?.recurring ? (
                <>
                    <RateOfRecurrence cost={cost} />
                    <RateOfChangeValue cost={cost} year={year} />
                    <RateOfChangeUnits cost={cost} year={year} />
                </>
            ) : null}
        </View>
    );
}
