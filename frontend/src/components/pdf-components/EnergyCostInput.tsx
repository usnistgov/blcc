import { Text, View } from "@react-pdf/renderer";
import { CostName, CostSavings, Description, RateOfRecurrence, UseIndex } from "./CostComponents";
import InputTable from "./InputTable";
import { styles } from "./pdfStyles";

const EnergyCostInput = (props: { cost; year: number }) => {
    //TODO: specify type for cost
    const { cost, year } = props;
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
                    <Text style={styles.value}>{cost?.annualConsumption + " " + cost?.unit}</Text>
                </View>
            ) : null}

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

            {cost?.expectedLife ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Expected Lifetime:&nbsp;</Text>
                    <Text style={styles.value}> {cost.expectedLife} year(s)</Text>
                </View>
            ) : null}

            {cost?.costAdjustment ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Cost Adjustment:&nbsp;</Text>
                    <Text style={styles.value}> {cost?.costAdjustment}</Text>
                </View>
            ) : null}

            {cost?.escalation ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Escalation Rates:&nbsp;</Text>
                    <InputTable cost={cost} header={"Escalation Rates %"} inputRows={cost?.escalation} year={year} />
                </View>
            ) : null}

            <RateOfRecurrence cost={cost} />

            {cost?.location ? (
                <>
                    <View style={styles.key}>
                        <Text style={styles.text}>Country:&nbsp;</Text>
                        <Text style={styles.value}> {cost?.location?.country}</Text>
                    </View>
                    <View style={styles.key}>
                        <Text style={styles.text}>State:&nbsp;</Text>
                        <Text style={styles.value}> {cost?.location?.state}</Text>
                    </View>
                    <View style={styles.key}>
                        <Text style={styles.text}>City:&nbsp;</Text>
                        <Text style={styles.value}> {cost?.location?.city}</Text>
                    </View>
                    <View style={styles.key}>
                        <Text style={styles.text}>Zipcode:&nbsp;</Text>
                        <Text style={styles.value}> {cost?.location?.zipcode}</Text>
                    </View>
                </>
            ) : null}

            <UseIndex cost={cost} year={year} />
        </View>
    );
};

export default EnergyCostInput;
