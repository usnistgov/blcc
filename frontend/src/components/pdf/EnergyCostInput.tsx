import { Text, View } from "@react-pdf/renderer";
import type { EnergyCost, USLocation } from "blcc-format/Format";
import {
    CostName,
    CostPerUnit,
    CostSavings,
    Description,
    EscalationRates,
    UseIndex,
} from "./components/CostComponents";
import { styles } from "./pdfStyles";
import { dollarFormatter } from "util/Util";
import { LabeledText } from "./components/GeneralComponents";

type EnergyCostInputProps = {
    cost: EnergyCost;
    year: number;
};

export default function EnergyCostInput({ cost, year }: EnergyCostInputProps) {
    return (
        <View key={cost.id}>
            <CostName cost={cost} />
            <Description cost={cost} />
            <CostSavings cost={cost} />

            {cost?.fuelType ? <LabeledText label="Fuel Type" text={cost?.fuelType} /> : null}

            {cost?.customerSector ? <LabeledText label="Customer Sector" text={cost?.customerSector} /> : null}

            {cost?.annualConsumption ? (
                <LabeledText
                    label={cost?.costSavings ? "Annual Consumption Savings" : "Annnual Consumption"}
                    text={`${cost?.annualConsumption} ${cost?.unit}`}
                />
            ) : null}

            <CostPerUnit cost={cost} />

            {cost?.rebate ? <LabeledText label="Rebate" text={dollarFormatter.format(cost?.rebate)} /> : null}

            {cost?.demandCharge ? (
                <LabeledText label="Demand Charge" text={dollarFormatter.format(cost?.demandCharge)} />
            ) : null}

            {cost?.location ? (
                <View style={styles.container}>
                    <View style={styles.row}>
                        <LabeledText containerStyle={styles.item} label="Country" text={cost?.location?.country} />
                        <LabeledText
                            containerStyle={styles.item}
                            label="State"
                            text={(cost.location as USLocation)?.state}
                        />
                    </View>
                    <View style={styles.row}>
                        <LabeledText containerStyle={styles.item} label="City" text={cost?.location?.city} />
                        <LabeledText
                            containerStyle={styles.item}
                            label="Zipcode"
                            text={(cost.location as USLocation)?.zipcode ?? ""}
                        />
                    </View>
                </View>
            ) : (
                <LabeledText label="Location" text="Same as Project Location" />
            )}

            <EscalationRates cost={cost} year={year} />
            <UseIndex cost={cost} year={year} />
        </View>
    );
}
