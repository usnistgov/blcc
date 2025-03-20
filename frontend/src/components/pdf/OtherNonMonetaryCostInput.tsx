import { Text, View } from "@react-pdf/renderer";
import type { OtherNonMonetary, Project } from "blcc-format/Format";
import {
    CostName,
    Description,
    InitialOccurence,
    RateOfChangeUnits,
    RateOfChangeValue,
    RateOfRecurrence,
    Recurring,
} from "components/pdf/components/CostComponents";
import { styles } from "components/pdf/pdfStyles";
import { LabeledText } from "./components/GeneralComponents";

type OtherNonMonetaryCostInputProps = {
    cost: OtherNonMonetary;
    year: number;
    project: Project;
};

export default function OtherNonMonetaryCostInput({ cost, year, project }: OtherNonMonetaryCostInputProps) {
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

            <InitialOccurence cost={cost} />

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
