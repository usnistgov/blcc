import { Text, View } from "@react-pdf/renderer";
import { Defaults } from "blcc-format/Defaults";
import { type Alternative, type Cost, CostTypes } from "blcc-format/Format";
import ImplementationContractCostInput from "components/pdf/ImplementationContractCostInput";
import OmrCostInput from "components/pdf/OmrCostInput";
import OtherNonMonetaryCostInput from "components/pdf/OtherNonMonetaryCostInput";
import RecurringContractCostInput from "components/pdf/RecurringContractCostInput";
import ReplacementCapitalCostInput from "components/pdf/ReplacementCapitalCostInput";
import CapitalCostInput from "./CapitalCostInput";
import EnergyCostInput from "./EnergyCostInput";
import OtherCostInput from "./OtherCostInput";
import WaterCostInput from "./WaterCostInput";
import { styles } from "./pdfStyles";
import { LabeledText, TitleWithSubtitle } from "./components/GeneralComponents";

type AlternativesProps = {
    alts: Alternative[];
    costs: Cost[];
    releaseYear: number;
};

export default function Alternatives({ alts, costs, releaseYear }: AlternativesProps) {
    const getAltCosts = (alt: Alternative) => {
        const altCost = alt.costs;
        const altCosts = [];
        const len = costs.length;
        for (let i = 0; i < len; i++) {
            if (altCost.includes(costs[i].id ?? Defaults.INVALID_ID)) altCosts.push(costs[i]);
        }
        return altCosts;
    };

    return (
        <View style={styles.section}>
            <TitleWithSubtitle title="Alternatives" subtitle={`Total - ${alts.length}`} />
            <br />
            {alts.map((alt: Alternative, idx: number) => {
                return (
                    <View key={alt.id}>
                        <Text style={styles.altHeading}>
                            Alternative {idx + 1} - {alt.name}
                        </Text>

                        {alt?.description ? (
                            <View style={styles.key}>
                                <Text style={styles.text}>Description:&nbsp;</Text>
                                <Text style={styles.desc}>{alt.description}</Text>
                            </View>
                        ) : null}
                        <LabeledText label="Baseline" text={alt.baseline === false ? "No" : "Yes"} />
                        <LabeledText label="Total Costs" text={`${alt.costs.length}`} />
                        {getAltCosts(alt)?.map((cost: Cost) => {
                            return (
                                <View style={styles.costContainer} key={cost.id}>
                                    {cost.type === CostTypes.CAPITAL && (
                                        <CapitalCostInput cost={cost} year={releaseYear} />
                                    )}
                                    {cost.type === CostTypes.OMR && <OmrCostInput cost={cost} year={releaseYear} />}
                                    {cost.type === CostTypes.REPLACEMENT_CAPITAL && (
                                        <ReplacementCapitalCostInput cost={cost} year={releaseYear} />
                                    )}

                                    {cost.type === CostTypes.ENERGY && (
                                        <EnergyCostInput cost={cost} year={releaseYear} />
                                    )}

                                    {cost.type === CostTypes.OTHER && <OtherCostInput cost={cost} year={releaseYear} />}
                                    {cost.type === CostTypes.OTHER_NON_MONETARY && (
                                        <OtherNonMonetaryCostInput cost={cost} year={releaseYear} />
                                    )}

                                    {cost.type === CostTypes.WATER && <WaterCostInput cost={cost} year={releaseYear} />}

                                    {cost.type === CostTypes.IMPLEMENTATION_CONTRACT && (
                                        <ImplementationContractCostInput cost={cost} />
                                    )}
                                    {cost.type === CostTypes.RECURRING_CONTRACT && (
                                        <RecurringContractCostInput cost={cost} year={releaseYear} />
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
}
