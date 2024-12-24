import { Image, StyleSheet, View } from "@react-pdf/renderer";
import { styles } from "./pdfStyles";

const NISTHeader = () => {
    return (
        <View fixed style={styles.mainHeader}>
            <Image style={{ ...styles.headerNistLogo, marginBottom: 15 }} src={"../public/645px-nist_logo-svg_1.png"} />
        </View>
    );
};

export default NISTHeader;
