import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { AnalysisType, DollarMethod, Project, USLocation } from "blcc-format/Format";
import React from "react";

const styles = StyleSheet.create({
    section: {
        display: "flex",
        flexDirection: "column",
        padding: 25
    },
    title: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 20
    },
    heading: {
        fontSize: 16,
        color: "rgba(0, 0, 0, 0.88)"
    },
    key: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 10
    },
    desc: {
        maxWidth: "100vw",
        marginBottom: 10
    },
    text: {
        fontSize: 14,
        color: "#979797"
    },
    value: {
        fontSize: 14,
        marginBottom: "5"
    },
    divider: {
        border: "1px solid black",
        margin: "2px 0 5px 0"
    },
    container: {
        display: "flex"
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10 // space between rows
    },
    item: {
        flex: 1,
        margin: 5
    }
});

const GeneralInformation = (props: { project: Project }) => {
    const project = props.project;
    return (
        <View style={styles.section}>
            <Text style={styles.title}>General Information</Text>
            <View style={styles.key}>
                <Text style={styles.text}>Project Name:&nbsp;</Text>
                <Text style={styles.value}>{project?.name}</Text>
            </View>
            <View style={styles.key}>
                <Text style={styles.text}>Analyst:&nbsp;</Text>
                <Text style={styles.value}>{project?.analyst}</Text>
            </View>
            <View style={styles.key}>
                <Text style={styles.text}>Analysis Type:&nbsp;</Text>
                <Text style={styles.value}>{project?.analysisType}</Text>
            </View>
            <br />
            {project?.analysisType === AnalysisType.OMB_NON_ENERGY ? (
                <View>
                    <Text style={styles.text}>Analysis Purpose:&nbsp;</Text>
                    <Text style={styles.value}>{project?.purpose}</Text>
                    <br />
                </View>
            ) : null}
            <br />
            {project?.description?.length !== 0 ? (
                <View style={styles.desc}>
                    <Text style={styles.text}>Project Description:&nbsp;</Text>
                    <Text style={styles.value}>{project?.description}</Text>
                    <br />
                </View>
            ) : null}
            <View style={styles.container}>
                <View style={styles.key}>
                    <View style={styles.item}>
                        <Text style={styles.text}>Study Period:&nbsp;</Text>
                        <Text style={styles.value}>{project?.studyPeriod} year(s)</Text>
                    </View>
                    <View style={styles.item}>
                        <Text style={styles.text}>Data Release Year:&nbsp;</Text>
                        <Text style={styles.value}>{project?.releaseYear}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.item}>
                        <Text style={styles.text}>Data Release Year:&nbsp;</Text>
                        <Text style={styles.value}>{project?.releaseYear}</Text>
                    </View>
                    <View style={styles.item}>
                        <Text style={styles.text}>EIA Projection Scenario:&nbsp;</Text>
                        <Text style={styles.value}>{project?.case}</Text>
                    </View>
                </View>
            </View>
            <br />
            <Text style={styles.heading}>Discounting:</Text>
            <hr style={styles.divider} />
            <View style={styles.container}>
                <View style={styles.key}>
                    <View style={styles.item}>
                        <Text style={styles.text}>Dollar Value:&nbsp;</Text>
                        <Text style={styles.value}>{project?.dollarMethod}</Text>
                    </View>
                    <View style={styles.item}>
                        <Text style={styles.text}>Discounting Convention:&nbsp;</Text>
                        <Text style={styles.value}>{project?.discountingMethod}</Text>
                    </View>
                </View>
                {project?.dollarMethod === DollarMethod.CONSTANT ? (
                    <View style={styles.row}>
                        <View style={styles.item}>
                            <Text style={styles.text}>Real Discount Rate:&nbsp;</Text>
                            <Text style={styles.value}>{project?.realDiscountRate}%</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.row}>
                        <View style={styles.item}>
                            <Text style={styles.text}>City:&nbsp;</Text>
                            <Text style={styles.value}>{project?.location?.city}</Text>
                        </View>
                        <View style={styles.item}>
                            <Text style={styles.text}>Zip:&nbsp;</Text>
                            <Text style={styles.value}>{(project?.location as USLocation)?.zipcode}</Text>
                        </View>
                    </View>
                )}
            </View>

            <Text style={styles.heading}>Location:</Text>
            <hr style={styles.divider} />
            <View style={styles.container}>
                <View style={styles.key}>
                    <View style={styles.item}>
                        <Text style={styles.text}>Country:&nbsp;</Text>
                        <Text style={styles.value}>{project?.location?.country}</Text>
                    </View>
                    <View style={styles.item}>
                        <Text style={styles.text}>State:&nbsp;</Text>
                        <Text style={styles.value}>{(project?.location as USLocation)?.state}</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.item}>
                        <Text style={styles.text}>City:&nbsp;</Text>
                        <Text style={styles.value}>{project?.location?.city}</Text>
                    </View>
                    <View style={styles.item}>
                        <Text style={styles.text}>Zip:&nbsp;</Text>
                        <Text style={styles.value}>{(project?.location as USLocation)?.zipcode}</Text>
                    </View>
                </View>
            </View>
            <br />

            <View>
                <Text style={styles.heading}>Greenhouse Gas (GHG) Emissions and Cost Assumptions:</Text>
                <hr style={styles.divider} />
                <View style={styles.container}>
                    <View style={styles.key}>
                        <View style={styles.item}>
                            <Text style={styles.text}>Data Source:&nbsp;</Text>
                            <Text style={styles.value}>{project?.ghg?.dataSource}</Text>
                        </View>
                        <View style={styles.item}>
                            <Text style={styles.text}>Emissions Rate Type:&nbsp;</Text>
                            <Text style={styles.value}>{project?.ghg?.emissionsRateType}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.item}>
                            <Text style={styles.text}>Social Cost of GHG Scenario:&nbsp;</Text>
                            <Text style={styles.value}>{project?.ghg?.socialCostOfGhgScenario}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default GeneralInformation;
