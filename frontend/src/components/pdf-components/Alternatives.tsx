import { Text, View } from "@react-pdf/renderer";
import { Alternative, Cost } from "blcc-format/Format";
import CapitalCostInput from "./CapitalCostInput";
import ContractCostInput from "./ContractCostInput";
import EnergyCostInput from "./EnergyCostInput";
import OtherCostInput from "./OtherCostInput";
import { styles } from "./pdfStyles";
import WaterCostInput from "./WaterCostInput";

const Alternatives = (props: { alternatives: Alternative[]; costs: Cost[]; releaseYear: number }) => {
    const alts = props.alternatives;
    const costs = props.costs;
    const releaseYear = props.releaseYear;

    const getAltCosts = (alt: Alternative) => {
        let altCost = alt.costs;
        const altCosts = [];
        for (let i = 0; i < costs.length; i++) {
            if (altCost.includes(costs[i]?.id)) altCosts.push(costs[i]);
        }
        return altCosts;
    };

    return (
        <View style={styles.section}>
            <Text style={styles.title}>Alternatives</Text>
            {alts.map((alt: Alternative) => {
                const altCosts = getAltCosts(alt);
                const lastIndex = altCosts.length - 1;
                return (
                    <View key={alt.id}>
                        <View style={styles.key}>
                            <Text style={styles.text}>Name:&nbsp; </Text>
                            <Text style={styles.value}>{alt.name}</Text>
                            <br />
                        </View>
                        {alt?.description ? (
                            <View style={styles.key}>
                                <Text style={styles.text}>Description:&nbsp;</Text>
                                <Text style={styles.desc}> {alt.description}</Text>
                                <br />
                            </View>
                        ) : null}
                        <View style={styles.key}>
                            <Text style={styles.text}>Baseline:&nbsp;</Text>
                            <Text style={styles.value}> {alt.baseline === false ? "No" : "Yes"}</Text>
                            <br />
                        </View>
                        <View style={styles.key}>
                            <Text style={styles.text}>Total Costs:&nbsp;</Text>
                            <Text style={styles.value}> {alt.costs.length}</Text>
                            <br />
                        </View>
                        {altCosts.map((cost: Cost, idx: number) => {
                            console.log(idx, lastIndex, cost.name);
                            return (
                                <View style={styles.costContainer} key={cost.id}>
                                    {(cost.type === "Capital" ||
                                        cost.type === "OMR" ||
                                        cost.type === "Replacement Capital") && (
                                        <CapitalCostInput cost={cost} year={releaseYear} />
                                    )}

                                    {cost.type === "Energy" && <EnergyCostInput cost={cost} year={releaseYear} />}

                                    {(cost.type === "Other Monetary" || cost.type === "Other Non-Monetary") && (
                                        <OtherCostInput cost={cost} year={releaseYear} />
                                    )}

                                    {cost.type === "Water" && <WaterCostInput cost={cost} year={releaseYear} />}

                                    {(cost.type === "Contract Implementation" ||
                                        cost.type === "Recurring Contract") && (
                                        <ContractCostInput cost={cost} year={releaseYear} />
                                    )}
                                    {idx !== lastIndex && <hr style={styles.subDivider} />}
                                </View>
                            );
                        })}
                        <hr style={styles.divider} />
                    </View>
                );
            })}
        </View>
    );
};

export default Alternatives;
