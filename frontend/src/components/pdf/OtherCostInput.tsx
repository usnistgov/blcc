import { Text, View } from "@react-pdf/renderer";
import {
    CostName,
    Description,
    InitialOccurence,
    RateOfChangeUnits,
    RateOfChangeValue,
    RateOfRecurrence,
    Recurring,
} from "./components/CostComponents";

import type { OtherCost } from "blcc-format/Format";
import { styles } from "./pdfStyles";
import { dollarFormatter } from "util/Util";
import { LabeledText } from "./components/GeneralComponents";

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

            {cost?.costOrBenefit ? <LabeledText label="Cost or Benefit" text={cost?.costOrBenefit} /> : null}

            <InitialOccurence cost={cost} />

            {cost?.valuePerUnit ? (
                <LabeledText
                    label="Value per Unit"
                    text={`${dollarFormatter.format(cost?.valuePerUnit)} per ${cost?.unit}`}
                />
            ) : null}

            {cost?.numberOfUnits ? (
                <LabeledText label="Number Of Units" text={`${cost?.numberOfUnits} ${cost?.unit}`} />
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
