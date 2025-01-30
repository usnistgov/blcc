import { Text, View } from "@react-pdf/renderer";
import { Alternative, Cost, Recurring } from "blcc-format/Format";
import CapitalCostInput from "./CapitalCostInput";
import ContractCostInput from "./ContractCostInput";
import EnergyCostInput from "./EnergyCostInput";
import OtherCostInput from "./OtherCostInput";
import { styles } from "./pdfStyles";
import WaterCostInput from "./WaterCostInput";

const Alternatives = (props: {
    alternatives: Alternative[];
    costs: Cost[] & { recurring: Recurring; occurrence: string; cost: string };
    releaseYear: number;
}) => {
    const alts = props.alternatives;
    const costs = props.costs;
    const releaseYear = props.releaseYear;

    console.log(alts, costs);

    const getAltCosts = (alt: Alternative) => {
        let altCost = alt.costs;
        const altCosts = [];
        let len = costs?.length || 0;
        for (let i = 0; i < len; i++) {
            if (altCost.includes(costs?.[i]?.id)) altCosts.push(costs?.[i]);
        }
        return altCosts;
    };

    return (
        <View style={styles.section}>
            <hr style={styles.titleDivider} />
            <View style={styles.titleWrapper}>
                <Text style={{ ...styles.title, marginBottom: 5 }}>Alternatives</Text>
                <Text style={styles.subTitle}>Total - {alts?.length}</Text>
            </View>
            <hr style={styles.titleDivider} />
            <br />
            {alts?.map((alt: Alternative, idx: number) => {
                return (
                    <View key={alt.id}>
                        <Text style={styles.altHeading}>
                            Alternative {idx + 1} - {alt.name}
                        </Text>

                        {alt?.description ? (
                            <View style={styles.key}>
                                <Text style={styles.text}>Description:&nbsp;</Text>
                                <Text style={styles.desc}> {alt.description}</Text>
                            </View>
                        ) : null}
                        <View style={styles.key}>
                            <Text style={styles.text}>Baseline:&nbsp;</Text>
                            <Text style={styles.value}> {alt.baseline === false ? "No" : "Yes"}</Text>
                        </View>
                        <View style={styles.key}>
                            <Text style={styles.text}>Total Costs:&nbsp;</Text>
                            <Text style={styles.value}> {alt.costs.length}</Text>
                        </View>
                        {getAltCosts(alt)?.map((cost: Cost) => {
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
