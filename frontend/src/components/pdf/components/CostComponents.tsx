import { Text, View } from "@react-pdf/renderer";
import type { Recurring as RecurringType } from "blcc-format/Format";
import { dollarFormatter, percentFormatter } from "util/Util";
import InputTable from "../InputTable";
import { styles } from "../pdfStyles";
import { LabeledText } from "./GeneralComponents";

interface Props {
    cost: {
        type?: string;
        name?: string;
        description?: string;
        costSavings?: boolean;
        initialCost?: number;
        costPerUnit?: number;
        expectedLife?: number;
        costAdjustment?: number;
        initialOccurrence?: number;
        annualRateOfChange?: number;
        recurring?: RecurringType;
        rateOfRecurrence?: number;
        useIndex?: number | number[];
        phaseIn?: number[];
        escalation?: number | number[];
    };
    year?: number;
}

export const CostName = ({ cost }: Props) => (
    <Text style={styles.subHeading}>
        Cost - {cost?.type}: {cost?.name || "Unnamed"}
    </Text>
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
            <LabeledText label="Cost or Savings" text={cost?.costSavings ? "Savings" : "Cost"} />
        ) : null}
    </>
);

export const InitialCost = ({ cost }: Props) => (
    <>
        {cost?.initialCost ? (
            <LabeledText
                label={cost.costSavings ? "Initial Cost Savings (Base Year)" : "Initial Cost"}
                text={dollarFormatter.format(cost?.initialCost)}
            />
        ) : null}
    </>
);

export const CostPerUnit = ({ cost }: Props) => (
    <>
        {cost?.costPerUnit ? (
            <LabeledText
                label={cost.costSavings ? "Cost Savings per Unit" : "Cost per Unit"}
                text={dollarFormatter.format(cost?.costPerUnit)}
            />
        ) : null}
    </>
);

export const ExpectedLife = ({ cost }: Props) => (
    <LabeledText label="Expected Lifetime" text={`${cost?.expectedLife ?? 0} year(s)`} />
);

export const CostAdjustmentFactor = ({ cost }: Props) => (
    <>
        {cost?.costAdjustment ? (
            <LabeledText label="Cost Adjustment Factor" text={percentFormatter.format(cost?.costAdjustment)} />
        ) : null}
    </>
);

export const AnnualRateOfChange = ({ cost }: Props) => (
    <>
        {cost?.annualRateOfChange ? (
            <LabeledText label="Annual Rate of Change" text={percentFormatter.format(cost?.annualRateOfChange)} />
        ) : null}
    </>
);

export const Recurring = ({ cost }: Props) => (
    <LabeledText label="Recurring" text={cost?.recurring !== undefined ? "Yes" : "No"} />
);

export const InitialOccurence = ({ cost }: Props) => (
    <>
        {cost?.initialOccurrence ? (
            <LabeledText label="Initial Occurrence" text={`${cost?.initialOccurrence} year(s)`} />
        ) : null}
    </>
);

export const RateOfRecurrence = ({ cost }: Props) => (
    <>
        {cost?.recurring?.rateOfRecurrence ? (
            <LabeledText label="Rate of Recurrence" text={`${cost?.recurring.rateOfRecurrence} year(s)`} />
        ) : null}
    </>
);
export const UseIndex = ({ cost, year }: Props) => {
    const isArray = Array.isArray(cost?.useIndex);
    return (
        <View style={isArray ? { margin: 0 } : styles.key}>
            <Text style={styles.text}>Usage Index:&nbsp;</Text>
            {isArray ? (
                <View style={{ marginBottom: 6 }}>
                    <View style={{ margin: 2 }} />
                    <InputTable header={"Usage (%)"} inputRows={(cost.useIndex as number[]) ?? []} year={year ?? -1} />
                </View>
            ) : (
                <Text style={styles.value}> {percentFormatter.format((cost?.useIndex as number) ?? 0)}</Text>
            )}
        </View>
    );
};

export const PhaseIn = ({ cost, year }: Props) => (
    <>
        {cost?.phaseIn && (
            <View style={styles.tableWrapper}>
                <Text style={styles.text}>Phase In:&nbsp;</Text>
                <View style={{ margin: 2 }} />
                <InputTable header="Phase In (%)" inputRows={cost?.phaseIn} year={year ?? -1} />
            </View>
        )}
    </>
);

export const RateOfChangeValue = ({ cost, year }: Props) => {
    const isArray = Array.isArray(cost?.recurring?.rateOfChangeValue);
    return (
        <View style={isArray ? { margin: 0 } : styles.key}>
            <Text style={styles.text}>Rate Of Change of Value:&nbsp;</Text>
            {isArray ? (
                <View style={{ marginBottom: 6 }}>
                    <View style={{ margin: 2 }} />
                    <InputTable
                        header={"Value Rate of Change (%)"}
                        inputRows={cost?.recurring?.rateOfChangeValue as number[]}
                        year={year ?? -1}
                    />
                </View>
            ) : (
                <Text style={styles.value}>
                    {percentFormatter.format((cost?.recurring?.rateOfChangeValue as number) ?? 0)}
                </Text>
            )}
        </View>
    );
};

export const RateOfChangeUnits = ({ cost, year }: Props) => {
    const isArray = Array.isArray(cost?.recurring?.rateOfChangeUnits);
    return (
        <View style={isArray ? { margin: 0 } : styles.key}>
            <Text style={styles.text}>Rate Of Change Units:&nbsp;</Text>
            {isArray ? (
                <View style={{ marginBottom: 6 }}>
                    <View style={{ margin: 2 }} />
                    <InputTable
                        header={"Unit Rate of Change (%)"}
                        inputRows={cost?.recurring?.rateOfChangeUnits as number[]}
                        year={year ?? -1}
                    />
                </View>
            ) : (
                <Text style={styles.value}>
                    {" "}
                    {percentFormatter.format((cost?.recurring?.rateOfChangeUnits as number) ?? 0)}
                </Text>
            )}
        </View>
    );
};

export const EscalationRates = ({ cost, year }: Props) => (
    <>
        {cost?.escalation ? (
            <View>
                <Text style={styles.text}>Escalation:&nbsp;</Text>
                {Array.isArray(cost?.escalation) ? (
                    <View style={{ marginBottom: 6 }}>
                        <View style={{ margin: 2 }} />
                        <InputTable header={"Escalation Rates (%)"} inputRows={cost?.escalation} year={year ?? -1} />
                    </View>
                ) : (
                    <Text style={styles.value}>{percentFormatter.format((cost?.escalation as number) ?? 0)}</Text>
                )}
            </View>
        ) : null}
    </>
);
