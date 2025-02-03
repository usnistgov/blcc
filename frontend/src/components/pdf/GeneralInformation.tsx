import { Text, View } from "@react-pdf/renderer";
import { AnalysisType, DollarMethod, type Project, type USLocation } from "blcc-format/Format";
import { styles } from "components/pdf/pdfStyles";

type GeneralInformationProps = {
    project: Project;
};

export default function GeneralInformation({ project }: GeneralInformationProps) {
    return (
        <View style={styles.section}>
            <hr style={styles.titleDivider} />
            <Text style={styles.title}>General Information</Text>
            <hr style={styles.titleDivider} />
            <View style={styles.key}>
                <Text style={styles.text}>Project Name:&nbsp;</Text>
                <Text style={styles.value}>{project.name}</Text>
            </View>
            <View style={styles.key}>
                <Text style={styles.text}>Analyst:&nbsp;</Text>
                <Text style={styles.value}>{project.analyst}</Text>
            </View>
            <View style={styles.key}>
                <Text style={styles.text}>Analysis Type:&nbsp;</Text>
                <Text style={styles.value}>{project.analysisType}</Text>
            </View>
            <br />
            {project.analysisType === AnalysisType.OMB_NON_ENERGY ? (
                <View style={styles.key}>
                    <Text style={styles.text}>Analysis Purpose:&nbsp;</Text>
                    <Text style={styles.value}>{project.purpose}</Text>
                    <br />
                </View>
            ) : null}
            <br />
            {project.description ? (
                <View style={{ ...styles.desc }}>
                    <Text style={styles.text}>Project Description:&nbsp;</Text>
                    <Text style={styles.value}>{project.description}</Text>
                    <br />
                </View>
            ) : null}
            <View style={{ ...styles.container, margin: 0 }}>
                <View style={styles.key}>
                    <View style={{ ...styles.item, ...styles.key }}>
                        <Text style={styles.text}>Study Period:&nbsp;</Text>
                        <Text style={styles.value}>{project.studyPeriod} year(s)</Text>
                    </View>
                    <View style={{ ...styles.item, ...styles.key }}>
                        <Text style={styles.text}>Construction Period:&nbsp;</Text>
                        <Text style={styles.value}>{project.constructionPeriod} year(s)</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{ ...styles.item, ...styles.key }}>
                        <Text style={styles.text}>Data Release Year:&nbsp;</Text>
                        <Text style={styles.value}>{project.releaseYear}</Text>
                    </View>
                    <View style={{ ...styles.item, ...styles.key }}>
                        <Text style={styles.text}>EIA Projection Scenario:&nbsp;</Text>
                        <Text style={styles.value}>{project.case}</Text>
                    </View>
                </View>
            </View>
            <br />
            <Text style={styles.heading}>Discounting:</Text>
            {/* <hr style={{ ...styles.divider, maxWidth: 85 }} /> */}
            <View style={styles.container}>
                <View style={styles.key}>
                    <View style={{ ...styles.item, ...styles.key }}>
                        <Text style={styles.text}>Dollar Value:&nbsp;</Text>
                        <Text style={styles.value}>{project.dollarMethod}</Text>
                    </View>
                    <View style={{ ...styles.item, ...styles.key }}>
                        <Text style={styles.text}>Discounting Convention:&nbsp;</Text>
                        <Text style={styles.value}>{project.discountingMethod}</Text>
                    </View>
                </View>
                {project.dollarMethod === DollarMethod.CONSTANT ? (
                    <View style={styles.row}>
                        <View style={{ ...styles.item, ...styles.key }}>
                            <Text style={styles.text}>Real Discount Rate:&nbsp;</Text>
                            <Text style={styles.value}>{project.realDiscountRate}%</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.row}>
                        <View style={{ ...styles.item, ...styles.key }}>
                            <Text style={styles.text}>Inflation Rate:&nbsp;</Text>
                            <Text style={styles.value}>{project.inflationRate}%</Text>
                        </View>
                        <View style={{ ...styles.item, ...styles.key }}>
                            <Text style={styles.text}>Nominal Discount Rate:&nbsp;</Text>
                            <Text style={styles.value}>{project.nominalDiscountRate}%</Text>
                        </View>
                    </View>
                )}
            </View>

            <Text style={styles.heading}>Location:</Text>
            {/* <hr style={{ ...styles.divider, maxWidth: 70 }} /> */}
            <View style={styles.container}>
                <View style={styles.key}>
                    <View style={{ ...styles.item, ...styles.key }}>
                        <Text style={styles.text}>Country:&nbsp;</Text>
                        <Text style={styles.value}>{project.location?.country}</Text>
                    </View>
                    <View style={{ ...styles.item, ...styles.key }}>
                        <Text style={styles.text}>State:&nbsp;</Text>
                        <Text style={styles.value}>{(project.location as USLocation)?.state}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={{ ...styles.item, ...styles.key }}>
                        <Text style={styles.text}>City:&nbsp;</Text>
                        <Text style={styles.value}>{project.location?.city}</Text>
                    </View>
                    <View style={{ ...styles.item, ...styles.key }}>
                        <Text style={styles.text}>Zip:&nbsp;</Text>
                        <Text style={styles.value}>{(project.location as USLocation)?.zipcode}</Text>
                    </View>
                </View>
            </View>
            <br />

            <View>
                <Text style={styles.heading}>Greenhouse Gas (GHG) Emissions and Cost Assumptions:</Text>
                {/* <hr style={{ ...styles.divider, maxWidth: 380 }} /> */}
                <View style={styles.container}>
                    <View style={styles.key}>
                        <View style={{ ...styles.item, ...styles.key }}>
                            <Text style={styles.text}>Data Source:&nbsp;</Text>
                            <Text style={styles.value}>{project.ghg?.dataSource}</Text>
                        </View>
                        <View style={{ ...styles.item, ...styles.key }}>
                            <Text style={styles.text}>Emissions Rate Type:&nbsp;</Text>
                            <Text style={styles.value}>{project.ghg?.emissionsRateType}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ ...styles.item, ...styles.key }}>
                            <Text style={styles.text}>Social Cost of GHG Scenario:&nbsp;</Text>
                            <Text style={styles.value}>{project.ghg?.socialCostOfGhgScenario}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
