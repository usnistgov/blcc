import { Text, View } from "@react-pdf/renderer";
import { EscalationRate, Recurring as RecurringType } from "blcc-format/Format";
import InputTable from "./InputTable";
import { styles } from "./pdfStyles";

interface Props {
    cost: {
        type?: string;
        name?: string;
        description?: string;
        costSavings?: Boolean;
        initialCost?: number;
        costPerUnit?: number;
        expectedLifetime?: number;
        costAdjustment?: number;
        initialOccurrence?: number;
        annualRateOfChange?: number;
        recurring?: any; // TODO: specify the correct type
        rateOfRecurrence?: number;
        useIndex?: number | number[];
        phaseIn?: number[];
        escalation?: any; // TODO: specify the correct type
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
                <Text style={styles.text}>Cost Savings:&nbsp;</Text>
                <Text style={styles.value}> {cost?.costSavings ? "Yes" : "No"}</Text>
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

export const CostPerUnit = ({ cost }: Props) => (
    <>
        {cost?.costPerUnit ? (
            <View style={styles.key}>
                {cost?.costSavings ? (
                    <Text style={styles.text}>Cost Savings per Unit:&nbsp;</Text>
                ) : (
                    <Text style={styles.text}>Cost per Unit:&nbsp;</Text>
                )}
                <Text style={styles.value}> ${cost?.costPerUnit} </Text>
            </View>
        ) : null}
    </>
);

export const ExpectedLife = ({ cost }: Props) => (
    <View style={styles.key}>
        <Text style={styles.text}>Expected Lifetime:&nbsp;</Text>
        <Text style={styles.value}> {cost?.expectedLifetime || 0} year(s)</Text>
    </View>
);

export const CostAdjustmentFactor = ({ cost }: Props) => (
    <>
        {cost?.costAdjustment ? (
            <View style={styles.key}>
                <Text style={styles.text}>Cost Adjustment Factor:&nbsp;</Text>
                <Text style={styles.value}> {cost?.costAdjustment}%</Text>
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
        {cost?.rateOfRecurrence ? (
            <View style={styles.key}>
                <Text style={styles.text}>Rate Of Recurrence:&nbsp;</Text>
                <Text style={styles.value}> {cost?.rateOfRecurrence} year(s)</Text>
            </View>
        ) : null}
    </>
);
export const UseIndex = ({ cost, year }: Props) => {
    const value = Array.isArray(cost?.useIndex);
    return (
        <View style={value ? { margin: 0 } : styles.key}>
            <Text style={styles.text}>Usage Index:&nbsp;</Text>
            {value ? (
                <View style={{ marginBottom: 6 }}>
                    <View style={{ margin: 2 }} />
                    <InputTable cost={cost} header={"Usage (%)"} inputRows={cost?.useIndex} year={year} />
                </View>
            ) : (
                <Text style={styles.value}> {cost?.useIndex}%</Text>
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
                <InputTable cost={cost} header="Phase In (%)" inputRows={cost?.phaseIn} year={year} />
            </View>
        )}
    </>
);

export const RateOfChangeValue = ({ cost, year }: Props) => {
    const value = Array.isArray(cost?.recurring?.rateOfChangeValue);
    return (
        <View style={value ? { margin: 0 } : styles.key}>
            <Text style={styles.text}>Rate Of Change of Value:&nbsp;</Text>
            {value ? (
                <View style={{ marginBottom: 6 }}>
                    <View style={{ margin: 2 }} />
                    <InputTable
                        cost={cost}
                        header={"Value Rate of Change (%)"}
                        inputRows={cost?.recurring?.rateOfChangeValue}
                        year={year}
                    />
                </View>
            ) : (
                <Text style={styles.value}> {cost?.recurring?.rateOfChangeValue}%</Text>
            )}
        </View>
    );
};

export const RateOfChangeUnits = ({ cost, year }: Props) => {
    const value = Array.isArray(cost?.recurring?.rateOfChangeUnits);
    return (
        <View style={value ? { margin: 0 } : styles.key}>
            <Text style={styles.text}>Rate Of Change Units:&nbsp;</Text>
            {value ? (
                <View style={{ marginBottom: 6 }}>
                    <View style={{ margin: 2 }} />
                    <InputTable
                        cost={cost}
                        header={"Unit Rate of Change (%)"}
                        inputRows={cost?.recurring?.rateOfChangeUnits}
                        year={year}
                    />
                </View>
            ) : (
                <Text style={styles.value}> {cost?.recurring?.rateOfChangeUnits}%</Text>
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
                        <InputTable
                            cost={cost}
                            header={"Escalation Rates (%)"}
                            inputRows={cost?.escalation}
                            year={year}
                        />
                    </View>
                ) : (
                    <Text style={styles.value}> {cost?.escalation}%</Text>
                )}
            </View>
        ) : null}
    </>
);
