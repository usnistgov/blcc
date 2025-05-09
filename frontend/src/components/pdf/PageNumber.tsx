import { Text } from "@react-pdf/renderer";
import { styles } from "./pdfStyles";

const PageNumber = () => (
    <Text fixed style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
);

export default PageNumber;
