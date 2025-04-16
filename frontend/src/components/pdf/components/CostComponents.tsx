import { Text, View } from "@react-pdf/renderer";
import { DollarMethod, type Project, type Recurring as RecurringType } from "blcc-format/Format";
import {
    calculateNominalDiscountRate,
    calculateNominalPercentage,
    calculateRealDiscountRate,
    dollarFormatter,
    percentFormatter,
} from "util/Util";
import InputTable from "../InputTable";
import { styles } from "../pdfStyles";
import { LabeledText } from "./GeneralComponents";
import { Defaults } from "blcc-format/Defaults";

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
        rateOfChangeValue?: number | number[];
        rateOfChangeUnits?: number | number[];
        recurring?: RecurringType;
        rateOfRecurrence?: number;
        useIndex?: number | number[];
        valueRateOfChange?: number;
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
        {cost?.description !== undefined ? (
            <View style={styles.key}>
                <Text style={styles.text}>Description:&nbsp;</Text>
                <Text style={styles.desc}> {cost?.description}</Text>
            </View>
        ) : null}
    </>
);

export const CostSavings = ({ cost }: Props) => (
    <>
        {cost?.costSavings !== undefined ? (
            <LabeledText label="Cost or Savings" text={cost?.costSavings ? "Savings" : "Cost"} />
        ) : null}
    </>
);

export const InitialCost = ({ cost }: Props) => (
    <>
        {cost?.initialCost !== undefined ? (
            <LabeledText
                label={cost.costSavings ? "Initial Cost Savings (Base Year)" : "Initial Cost"}
                text={dollarFormatter.format(cost?.initialCost)}
            />
        ) : null}
    </>
);

export const CostPerUnit = ({ cost }: Props) => (
    <>
        {cost?.costPerUnit !== undefined ? (
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

export const CostAdjustmentFactor = ({ cost, project }: Props & { project: Project }) => (
    <>
        {cost?.costAdjustment !== undefined ? (
            <LabeledText
                label="Cost Adjustment Factor"
                text={calculateNominalPercentage(
                    cost?.costAdjustment,
                    project.inflationRate ?? Defaults.INFLATION_RATE,
                    project.dollarMethod === DollarMethod.CURRENT,
                ).toString()}
            />
        ) : null}
    </>
);

export const AnnualRateOfChange = ({ cost, project }: Props & { project: Project }) => (
    <>
        {cost?.annualRateOfChange !== undefined ? (
            <LabeledText
                label="Annual Rate of Change"
                text={`${calculateNominalPercentage(
                    cost?.annualRateOfChange,
                    project?.inflationRate ?? Defaults.INFLATION_RATE,
                    project?.dollarMethod === DollarMethod.CURRENT,
                ).toString()}%`}
            />
        ) : null}
    </>
);

export const ValueRateOfChange = ({ cost, project }: Props & { project: Project }) => (
    <>
        {cost?.valueRateOfChange !== undefined ? (
            <LabeledText
                label="Value Rate of Change"
                text={`${calculateNominalPercentage(
                    cost?.valueRateOfChange,
                    project?.inflationRate ?? Defaults.INFLATION_RATE,
                    project?.dollarMethod === DollarMethod.CURRENT,
                ).toString()}%`}
            />
        ) : null}
    </>
);

export const Recurring = ({ cost }: Props) => (
    <LabeledText label="Recurring" text={cost?.recurring !== undefined ? "Yes" : "No"} />
);

export const InitialOccurence = ({ cost }: Props) => (
    <>
        {cost?.initialOccurrence !== undefined ? (
            <LabeledText label="Initial Occurrence" text={`${cost?.initialOccurrence} year(s)`} />
        ) : null}
    </>
);

export const RateOfRecurrence = ({ cost }: Props) => (
    <>
        {cost?.recurring?.rateOfRecurrence !== undefined ? (
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
        {cost?.phaseIn !== undefined && (
            <View style={styles.tableWrapper}>
                <Text style={styles.text}>Phase In:&nbsp;</Text>
                <View style={{ margin: 2 }} />
                <InputTable header="Phase In (%)" inputRows={cost?.phaseIn} year={year ?? -1} />
            </View>
        )}
    </>
);

export const RateOfChangeValue = ({ cost, year, project }: Props & { project: Project }) => {
    const isArray = Array.isArray(cost?.rateOfChangeValue);
    return (
        <View style={isArray ? { margin: 0 } : styles.key} wrap={false}>
            <Text style={styles.text}>Value Rate Of Change:&nbsp;</Text>
            {isArray ? (
                <View style={{ marginBottom: 6 }}>
                    <View style={{ margin: 2 }} />
                    <InputTable
                        header={"Value Rate of Change (%)"}
                        inputRows={(cost?.rateOfChangeValue as number[]).map((val) =>
                            project.dollarMethod === DollarMethod.CURRENT
                                ? calculateNominalDiscountRate(val, project.inflationRate ?? Defaults.INFLATION_RATE)
                                : val,
                        )}
                        year={year ?? -1}
                    />
                </View>
            ) : (
                <Text style={styles.value}>
                    {percentFormatter.format(
                        project?.dollarMethod === DollarMethod.CURRENT
                            ? calculateNominalDiscountRate(
                                  cost.rateOfChangeValue as number,
                                  project?.inflationRate ?? Defaults.INFLATION_RATE,
                              )
                            : (cost.rateOfChangeValue as number),
                    )}
                </Text>
            )}
        </View>
    );
};

export const RateOfChangeUnits = ({ cost, year }: Props) => {
    const isArray = Array.isArray(cost?.rateOfChangeUnits);
    return (
        <View style={isArray ? { margin: 0 } : styles.key}>
            <Text style={styles.text}>Rate Of Change Units:&nbsp;</Text>
            {isArray ? (
                <View style={{ marginBottom: 6 }}>
                    <View style={{ margin: 2 }} />
                    <InputTable
                        header={"Unit Rate of Change (%)"}
                        inputRows={cost?.rateOfChangeUnits as number[]}
                        year={year ?? -1}
                    />
                </View>
            ) : (
                <Text style={styles.value}> {percentFormatter.format((cost?.rateOfChangeUnits as number) ?? 0)}</Text>
            )}
        </View>
    );
};

export const EscalationRates = ({ cost, year, project }: Props & { project: Project }) => (
    <>
        {cost?.escalation !== undefined ? (
            <View>
                <Text style={styles.text}>Escalation:&nbsp;</Text>
                {Array.isArray(cost?.escalation) ? (
                    <View style={{ marginBottom: 6 }}>
                        <View style={{ margin: 2 }} />
                        <InputTable
                            header={"Escalation Rates (%)"}
                            inputRows={cost?.escalation.map((val) =>
                                calculateNominalPercentage(
                                    val,
                                    project.inflationRate ?? Defaults.INFLATION_RATE,
                                    project.dollarMethod === DollarMethod.CURRENT,
                                ),
                            )}
                            year={year ?? -1}
                        />
                    </View>
                ) : (
                    <Text style={styles.value}>{percentFormatter.format((cost?.escalation as number) ?? 0)}</Text>
                )}
            </View>
        ) : null}
    </>
);
