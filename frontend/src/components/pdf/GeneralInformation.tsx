import { Text, View } from "@react-pdf/renderer";
import { AnalysisType, DollarMethod, type Project, type USLocation } from "blcc-format/Format";
import { styles } from "components/pdf/pdfStyles";
import { percentFormatter } from "util/Util";
import { LabeledText, Title } from "./components/GeneralComponents";

type GeneralInformationProps = {
    project: Project;
};

export default function GeneralInformation({ project }: GeneralInformationProps) {
    return (
        <View style={styles.section}>
            <Title title="General Information" />
            <br />
            <LabeledText label="Project Name" text={project.name} />
            <LabeledText label="Analyst" text={project.analyst} />
            <LabeledText label="Analysis Type" text={project.analysisType} />
            <br />
            {project.analysisType === AnalysisType.OMB_NON_ENERGY ? (
                <LabeledText label="Analysis Purpose" text={project.purpose} />
            ) : null}
            <br />
            {project.description ? (
                <LabeledText containerStyle={styles.desc} label="Project Description" text={project.description} />
            ) : null}
            <View style={{ ...styles.container, margin: 0 }}>
                <View style={styles.key}>
                    <LabeledText
                        containerStyle={styles.item}
                        label="Study Period"
                        text={`${project.studyPeriod} year(s)`}
                    />
                    <LabeledText
                        containerStyle={styles.item}
                        label="Construction Period"
                        text={`${project.constructionPeriod} year(s)`}
                    />
                </View>
                <View style={styles.row}>
                    <LabeledText
                        containerStyle={styles.item}
                        label="Data Release Year:"
                        text={`${project.releaseYear}`}
                    />
                    <LabeledText containerStyle={styles.item} label="EIA Projection Scenario" text={project.case} />
                </View>
            </View>
            <br />
            <Text style={styles.heading}>Discounting:</Text>
            <View style={styles.container}>
                <View style={styles.key}>
                    <LabeledText containerStyle={styles.item} label="Dollar Value" text={project.dollarMethod} />
                    <LabeledText
                        containerStyle={styles.item}
                        label="Discounting Convention"
                        text={project.discountingMethod}
                    />
                </View>
                {project.dollarMethod === DollarMethod.CONSTANT ? (
                    <View style={styles.row}>
                        <LabeledText
                            containerStyle={styles.item}
                            label="Real Discount Rate"
                            text={percentFormatter.format(project.realDiscountRate ?? 0)}
                        />
                    </View>
                ) : (
                    <View style={styles.row}>
                        <LabeledText
                            containerStyle={styles.item}
                            label="Inflation Rate"
                            text={percentFormatter.format(project.inflationRate ?? 0)}
                        />
                        <LabeledText
                            containerStyle={styles.item}
                            label="Nominal Discount Rate"
                            text={percentFormatter.format(project.nominalDiscountRate ?? 0)}
                        />
                    </View>
                )}
            </View>

            <Text style={styles.heading}>Location:</Text>
            {/* <hr style={{ ...styles.divider, maxWidth: 70 }} /> */}
            <View style={styles.container}>
                <View style={styles.key}>
                    <LabeledText containerStyle={styles.item} label="Country" text={project.location?.country} />
                    <LabeledText
                        containerStyle={styles.item}
                        label="State"
                        text={(project.location as USLocation)?.state}
                    />
                </View>
                <View style={styles.row}>
                    <LabeledText containerStyle={styles.item} label="City" text={project.location?.city} />
                    <LabeledText
                        containerStyle={styles.item}
                        label="Zip"
                        text={(project.location as USLocation)?.zipcode}
                    />
                </View>
            </View>
            <br />

            <View>
                <Text style={styles.heading}>Greenhouse Gas (GHG) Emissions Assumptions:</Text>
                {/* <hr style={{ ...styles.divider, maxWidth: 380 }} /> */}
                <View style={styles.container}>
                    <View style={styles.key}>
                        <LabeledText containerStyle={styles.item} label="Data Source" text={project.ghg?.dataSource} />
                        <LabeledText
                            containerStyle={styles.item}
                            label="Emissions Rate Type"
                            text={project.ghg?.emissionsRateType}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}
