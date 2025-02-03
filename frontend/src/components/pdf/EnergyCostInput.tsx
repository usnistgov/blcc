import { Text, View } from "@react-pdf/renderer";
import type { EnergyCost, USLocation } from "blcc-format/Format";
import { CostName, CostPerUnit, CostSavings, Description, EscalationRates, UseIndex } from "./CostComponents";
import { styles } from "./pdfStyles";

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

            {cost?.fuelType ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Fuel Type:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.fuelType}</Text>
                </View>
            ) : null}

            {cost?.customerSector ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Customer Sector:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.customerSector}</Text>
                </View>
            ) : null}

            {cost?.annualConsumption ? (
                <View style={styles.key}>
                    {cost?.costSavings ? (
                        <Text style={styles.text}>Annual Consumption Savings:&nbsp;</Text>
                    ) : (
                        <Text style={styles.text}>Annual Consumption:&nbsp;</Text>
                    )}
                    <Text style={styles.value}>{`${cost?.annualConsumption} ${cost?.unit}`}</Text>
                </View>
            ) : null}

            <CostPerUnit cost={cost} />

            {cost?.rebate ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Rebate:&nbsp;</Text>
                    <Text style={styles.value}> ${cost?.rebate}</Text>
                </View>
            ) : null}

            {cost?.demandCharge ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Demand Charge:&nbsp;</Text>
                    <Text style={styles.value}> ${cost?.demandCharge}</Text>
                </View>
            ) : null}

            {cost?.location ? (
                <View style={styles.container}>
                    <View style={styles.row}>
                        <View style={{ ...styles.item, ...styles.key }}>
                            <Text style={styles.text}>Country:&nbsp;</Text>
                            <Text style={styles.value}> {cost?.location?.country}</Text>
                        </View>
                        <View style={{ ...styles.item, ...styles.key }}>
                            <Text style={styles.text}>State:&nbsp;</Text>
                            <Text style={styles.value}> {(cost.location as USLocation)?.state ?? ""}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ ...styles.item, ...styles.key }}>
                            <Text style={styles.text}>City:&nbsp;</Text>
                            <Text style={styles.value}> {cost?.location?.city}</Text>
                        </View>
                        <View style={{ ...styles.item, ...styles.key }}>
                            <Text style={styles.text}>Zipcode:&nbsp;</Text>
                            <Text style={styles.value}> {(cost.location as USLocation)?.zipcode ?? ""}</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.key}>
                    <Text style={styles.text}>Location:&nbsp;</Text>
                    <Text style={styles.value}> Same as Project Location</Text>
                </View>
            )}

            <EscalationRates cost={cost} year={year} />
            <UseIndex cost={cost} year={year} />
        </View>
    );
}
