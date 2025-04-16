import { Text, View } from "@react-pdf/renderer";
import {
    CostName,
    CostSavings,
    Description,
    InitialOccurence,
    RateOfChangeUnits,
    RateOfChangeValue,
    RateOfRecurrence,
    Recurring,
} from "./components/CostComponents";

import type { OtherCost, Project } from "blcc-format/Format";
import { styles } from "./pdfStyles";
import { dollarFormatter } from "util/Util";
import { LabeledText } from "./components/GeneralComponents";
import { BcnType } from "@lrd/e3-sdk";

type OtherCostInputProps = {
    cost: OtherCost;
    year: number;
    project: Project;
};

export default function OtherCostInput({ cost, year, project }: OtherCostInputProps) {
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

            <LabeledText label="Cost or Benefit" text={cost?.costSavings ? BcnType.COST : BcnType.BENEFIT} />

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
                    <RateOfChangeValue cost={cost} year={year} project={project} />
                    <RateOfChangeUnits cost={cost} year={year} />
                </>
            ) : null}
        </View>
    );
}
