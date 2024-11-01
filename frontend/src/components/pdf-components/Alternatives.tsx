import { Text, View } from "@react-pdf/renderer";
import { Alternative } from "blcc-format/Format";
import { styles } from "./pdfStyles";

const Alternatives = (props: { alternatives: Alternative[] }) => {
    const alts = props.alternatives;
    console.log(alts);
    return (
        <View style={styles.section}>
            <Text style={styles.title}>Alternatives</Text>
            {alts.map((alt: Alternative) => {
                return (
                    <View key={alt.id}>
                        <View style={styles.key}>
                            <Text style={styles.text}>Name:&nbsp; </Text>
                            <Text style={styles.value}>{alt.name}</Text>
                            <br />
                        </View>
                        <View style={styles.key}>
                            <Text style={styles.text}>Description:&nbsp;</Text>
                            <Text style={styles.desc}> {alt.description}</Text>
                            <br />
                        </View>
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
                        <hr style={styles.divider} />
                    </View>
                );
            })}
        </View>
    );
};

export default Alternatives;
