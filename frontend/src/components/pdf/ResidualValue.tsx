import { Text, View } from "@react-pdf/renderer";
import type { DollarOrPercent } from "blcc-format/Format";
import { styles } from "./pdfStyles";
import { dollarFormatter, percentFormatter } from "util/Util";
import { LabeledText } from "./components/GeneralComponents";

type ResidualValueProps = {
    residualValue: number;
    approach: DollarOrPercent;
};

export default function ResidualValue({ residualValue, approach }: ResidualValueProps) {
    return approach === "$" ? (
        <LabeledText label="Residual Value" text={dollarFormatter.format(residualValue)} />
    ) : (
        <LabeledText label="Residual Value" text={percentFormatter.format(residualValue)} />
    );
}
