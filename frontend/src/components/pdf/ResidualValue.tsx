import { Text, View } from "@react-pdf/renderer";
import type { DollarOrPercent } from "blcc-format/Format";
import { styles } from "./styles/pdfStyles";
import { dollarFormatter, percentFormatter } from "util/Util";

type ResidualValueProps = {
    residualValue: number;
    approach: DollarOrPercent;
};

export default function ResidualValue({ residualValue, approach }: ResidualValueProps) {
    return approach === "$" ? (
        <View style={styles.key}>
            <Text style={styles.text}>Residual Value:&nbsp;</Text>
            <Text style={styles.value}>{dollarFormatter.format(residualValue)}</Text>
        </View>
    ) : (
        <View style={styles.key}>
            <Text style={styles.text}>Residual Value:&nbsp;</Text>
            <Text style={styles.value}>{percentFormatter.format(residualValue)}</Text>
        </View>
    );
}
