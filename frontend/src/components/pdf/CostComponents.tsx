import { Text, View } from "@react-pdf/renderer";
import type { Recurring as RecurringType } from "blcc-format/Format";
import { dollarFormatter, percentFormatter } from "util/Util";
import InputTable from "./InputTable";
import { styles } from "./styles/pdfStyles";

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
            <View style={styles.key}>
                <Text style={styles.text}>Cost or Savings:&nbsp;</Text>
                <Text style={styles.value}> {cost?.costSavings ? "Savings" : "Cost"}</Text>
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
                <Text style={styles.value}> {dollarFormatter.format(cost?.initialCost)}</Text>
            </View>
        ) : null}
    </>
);

export const CostPerUnit = ({ cost }: Props) => (
    <>
        {cost?.costPerUnit ? (
            <View style={styles.key}>
                {cost?.costSavings ? (
                    <Text style={styles.text}>Cost Savings per Unit:&nbsp;</Text>
                ) : (
                    <Text style={styles.text}>Cost per Unit:&nbsp;</Text>
                )}
                <Text style={styles.value}> {dollarFormatter.format(cost?.costPerUnit)} </Text>
            </View>
        ) : null}
    </>
);

export const ExpectedLife = ({ cost }: Props) => (
    <View style={styles.key}>
        <Text style={styles.text}>Expected Lifetime:&nbsp;</Text>
        <Text style={styles.value}> {cost?.expectedLife ?? 0} year(s)</Text>
    </View>
);

export const CostAdjustmentFactor = ({ cost }: Props) => (
    <>
        {cost?.costAdjustment ? (
            <View style={styles.key}>
                <Text style={styles.text}>Cost Adjustment Factor:&nbsp;</Text>
                <Text style={styles.value}>{percentFormatter.format(cost?.costAdjustment)}</Text>
            </View>
        ) : null}
    </>
);

export const AnnualRateOfChange = ({ cost }: Props) => (
    <>
        {cost?.annualRateOfChange ? (
            <View style={styles.key}>
                <Text style={styles.text}>Annual Rate of Change:&nbsp;</Text>
                <Text style={styles.value}> {percentFormatter.format(cost?.annualRateOfChange)}</Text>
            </View>
        ) : null}
    </>
);

export const Recurring = ({ cost }: Props) => (
    <View style={styles.key}>
        <Text style={styles.text}>Recurring:&nbsp;</Text>
        <Text style={styles.value}> {cost?.recurring !== undefined ? "Yes" : "No"}</Text>
    </View>
);

export const InitialOccurence = ({ cost }: Props) => (
    <>
        {cost?.initialOccurrence ? (
            <View style={styles.key}>
                <Text style={styles.text}>Initial Occurrence:&nbsp;</Text>
                <Text style={styles.value}> {cost?.initialOccurrence} year(s)</Text>
            </View>
        ) : null}
    </>
);

export const RateOfRecurrence = ({ cost }: Props) => (
    <>
        {cost?.recurring?.rateOfRecurrence ? (
            <View style={styles.key}>
                <Text style={styles.text}>Rate Of Recurrence:&nbsp;</Text>
                <Text style={styles.value}>{cost?.recurring.rateOfRecurrence} year(s)</Text>
            </View>
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
