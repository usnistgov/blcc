import type { Maybe } from "@opentelemetry/sdk-metrics/build/src/utils";
import { lightGray, styles } from "../pdfStyles";
import { Path, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";

interface TitleProps {
    title: string;
}

export function Title({ title }: TitleProps) {
    return (
        <>
            <hr style={styles.titleDivider} />
            <View style={styles.titleWrapper}>
                <Text style={{ ...styles.title, marginBottom: 5 }}>{title}</Text>
            </View>
            <hr style={styles.titleDivider} />
        </>
    );
}

interface TitleWithSubtitleProps {
    title: string;
    subtitle: string;
}

export function TitleWithSubtitle({ title, subtitle }: TitleWithSubtitleProps) {
    return (
        <>
            <hr style={styles.titleDivider} />
            <View style={styles.titleWrapper}>
                <Text style={{ ...styles.title, marginBottom: 5 }}>{title}</Text>
                <Text style={styles.subTitle}>{subtitle}</Text>
            </View>
            <hr style={styles.titleDivider} />
        </>
    );
}

interface SmallTextProps {
    text: string;
    rightAlign?: boolean;
}

export function SmallText({ text, rightAlign }: SmallTextProps) {
    const rightStyle = rightAlign ? { rightAlign: "right" } : {};
    return <Text style={{ ...styles.smallFontSize, ...rightStyle }}>{text}</Text>;
}

export function Checkmark() {
    return (
        <Svg viewBox="0 0 100 100" height={12} width="auto">
            <Path
                d="M78.049,19.015L29.458,67.606c-0.428,0.428-1.121,0.428-1.548,0L0.32,40.015c-0.427-0.426-0.427-1.119,0-1.547l6.704-6.704
            c0.428-0.427,1.121-0.427,1.548,0l20.113,20.112l41.113-41.113c0.429-0.427,1.12-0.427,1.548,0l6.703,6.704
            C78.477,17.894,78.477,18.586,78.049,19.015z"
                stroke="#000000"
                fill="#000000"
            />
        </Svg>
    );
}

interface LabeledTextProps {
    label: string;
    text: string | undefined;
    containerStyle?: { [key: string]: string | number };
}

export function LabeledText({ label, text, containerStyle }: LabeledTextProps) {
    return (
        <View style={{ ...containerStyle, ...styles.key }}>
            <Text style={styles.text}>{label}: </Text>
            <Text style={styles.value}>{text}</Text>
        </View>
    );
}

export interface GridCol {
    // Used for accessing properties of the rows
    key: string;
    // Used for displaying in headers: can be single or multi-tiered
    name: string[] | string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    renderCell?: Maybe<(row: any, col: any) => ReactNode>;
    formatter?: Intl.NumberFormat;
}

interface GridProps {
    rows: {
        [key: string]: string | number | boolean;
    }[];
    columns: GridCol[];
    summary?: {
        [key: string]: string | number | boolean;
    };
    containerStyle?: { [key: string]: string | number };
    fontSize?: number;
}

export function Grid({ rows, columns, summary, containerStyle, fontSize }: GridProps) {
    fontSize = fontSize ?? styles.smallFontSize.fontSize;

    return (
        <>
            <View style={{ borderLeft: "1px solid #000", borderTop: "1px solid #000", ...containerStyle }} wrap={false}>
                {/* Header(s) */}
                {/* If column names are arrays, */}
                {Array.isArray(columns[0].name) ? (
                    // Make columns into header rows we can iterate across horizontally
                    getHeaderRows(columns).map((headerRow, outerIdx) => (
                        <View key={`header_${outerIdx}`} style={{ ...styles.flexRow, ...styles.gridHeader }}>
                            {headerRow.map((headerName, innerIdx) => (
                                <View key={`${headerName}_${innerIdx}`} style={{ ...styles.gridItem }}>
                                    <Text style={{ fontSize: fontSize }}>{headerName}</Text>
                                </View>
                            ))}
                        </View>
                    ))
                ) : (
                    // Else, just iterate across like normal
                    <View style={{ ...styles.flexRow, ...styles.gridHeader }}>
                        {columns.map((col) => (
                            <View key={col.key} style={styles.gridItem}>
                                <Text style={{ fontSize: fontSize }}>{col.name}</Text>
                            </View>
                        ))}
                    </View>
                )}
                {/* Main rows of the table */}
                {rows.map((row, rowIdx) => (
                    <View key={`row_${rowIdx}`} style={styles.flexRow}>
                        {columns.map((col, colIdx) => (
                            <View key={`${col.key}_${colIdx}`} style={styles.gridItem}>
                                {col.renderCell ? (
                                    col.renderCell(row, col)
                                ) : (
                                    <Text style={{ fontSize: fontSize }}>
                                        {col.formatter
                                            ? col.formatter.format((row[col.key] ?? 0) as number)
                                            : row[col.key]}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                ))}
                {/* Summary */}
                {summary ? (
                    <View key={`${summary.key}`} style={{ ...styles.flexRow, backgroundColor: lightGray }}>
                        {columns.map((col, i) => (
                            <View key={`${col.key}_${i}`} style={styles.gridItem}>
                                {col.renderCell ? (
                                    col.renderCell(summary, col)
                                ) : (
                                    <Text style={{ fontSize: fontSize }}>
                                        {col.formatter
                                            ? col.formatter.format((summary[col.key] ?? 0) as number)
                                            : summary[col.key]}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                ) : (
                    <></>
                )}
            </View>
        </>
    );
}

// Reformat columns into horizontal header rows
// e.g. [[upperHeader1, lowerHeader1], [upperHeader2, lowerHeader2]] => [[upperHeader1, upperHeader2], [lowerHeader1, lowerHeader2]]
function getHeaderRows(columns: GridCol[]): string[][] {
    const headerRows: string[][] = [];
    const longestHeaderLen = columns.reduce(
        // Get the length of the longest inner array
        (longestSoFar, col) => (col.name.length < longestSoFar ? longestSoFar : col.name.length),
        columns[0].name.length,
    );
    for (let i = 0; i < longestHeaderLen; i++) {
        headerRows[i] = [];
        for (let j = 0; j < columns.length; j++) {
            headerRows[i].push(columns[j].name[i] ?? "");
        }
    }
    return headerRows;
}
