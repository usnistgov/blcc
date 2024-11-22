import { Text, View } from "@react-pdf/renderer";
import InputTable from "./InputTable";
import { styles } from "./pdfStyles";

interface Props {
    cost: {
        type?: string;
        name?: string;
        description?: string;
        costSavings?: Boolean;
        initialCost?: number;
        annualRateOfChange?: number;
        recurring?: Boolean;
        rateOfRecurrence?: number;
        useIndex?: number[];
        phaseIn?: number[];
    };
    year?: number;
}

export const CostName = ({ cost }: Props) => (
    <View style={styles.key}>
        <Text style={styles.subHeading}>
            {cost?.type}: {cost?.name || "Unnamed"}
        </Text>
    </View>
);

export const Description = ({ cost }: Props) => (
    <>
        {cost?.description ? (
            <View style={styles.key}>
                <Text style={styles.text}>Description:&nbsp;</Text>
                <Text style={styles.desc}> {cost?.description}</Text>
            </View>
        ) : null}
    </>
);

export const CostSavings = ({ cost }: Props) => (
    <>
        {cost?.costSavings ? (
            <View style={styles.key}>
                <Text style={styles.text}>Cost Savings:&nbsp;</Text>
                <Text style={styles.value}> {cost.costSavings ? "Yes" : "No"}</Text>
            </View>
        ) : null}
    </>
);

export const InitialCost = ({ cost }: Props) => (
    <>
        {cost?.initialCost ? (
            <View style={styles.key}>
                {cost?.costSavings ? (
                    <Text style={styles.text}>Initial Cost Savings (Base Year):&nbsp;</Text>
                ) : (
                    <Text style={styles.text}>Initial Cost:&nbsp;</Text>
                )}
                <Text style={styles.value}> ${cost?.initialCost}</Text>
            </View>
        ) : null}
    </>
);

export const AnnualRateOfChange = ({ cost }: Props) => (
    <>
        {cost?.annualRateOfChange ? (
            <View style={styles.key}>
                <Text style={styles.text}>Annual Rate of Change:&nbsp;</Text>
                <Text style={styles.value}> {cost?.annualRateOfChange}%</Text>
            </View>
        ) : null}
    </>
);

export const Recurring = ({ cost }: Props) => (
    <View style={styles.key}>
        <Text style={styles.text}>Recurring:&nbsp;</Text>
        <Text style={styles.value}> {cost?.recurring ? "Yes" : "No"}</Text>
    </View>
);

export const RateOfRecurrence = ({ cost }: Props) => (
    <>
        {cost?.rateOfRecurrence ? (
            <View style={styles.key}>
                <Text style={styles.text}>Rate Of Recurrence:&nbsp;</Text>
                <Text style={styles.value}> {cost?.rateOfRecurrence} year(s)</Text>
            </View>
        ) : null}
    </>
);
export const UseIndex = ({ cost, year }: Props) => (
    <>
        {cost?.useIndex && (
            <View style={styles.key}>
                <Text style={styles.text}>Usage Index:&nbsp;</Text>
                <InputTable cost={cost} header="Usage %" inputRows={cost.useIndex} year={year} />
            </View>
        )}
    </>
);

export const PhaseIn = ({ cost, year }: Props) => (
    <>
        {cost?.phaseIn && (
            <View style={styles.key}>
                <Text style={styles.text}>Phase In:&nbsp;</Text>
                <InputTable cost={cost} header="Phase In (%)" inputRows={cost.phaseIn} year={year} />
            </View>
        )}
    </>
);
