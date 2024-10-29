import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { AnalysisType, DollarMethod, USLocation } from "blcc-format/Format";
import { useProject } from "model/Model";
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
        fontSize: 14
    }
});

const GeneralInformation = () => {
    const project = useProject();
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
                <View style={styles.desc}>
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
            <View style={styles.key}>
                <Text style={styles.text}>Study Period:&nbsp;</Text>
                <Text style={styles.value}>{project?.studyPeriod} year(s)</Text>
            </View>
            <br />
            <View style={styles.key}>
                <Text style={styles.text}>Construction Period:&nbsp;</Text>
                <Text style={styles.value}>{project?.constructionPeriod}</Text>
            </View>
            <br />
            <View style={styles.key}>
                <Text style={styles.text}>Data Release Year:&nbsp;</Text>
                <Text style={styles.value}>{project?.name}</Text>
            </View>
            <br />
            <View style={styles.key}>
                <Text style={styles.text}>EIA Projection Scenario:&nbsp;</Text>
                <Text style={styles.value}>{project?.name}</Text>
            </View>
            <br />
            <Text style={styles.text}>Discounting:</Text>
            <>
                <View style={styles.key}>
                    <Text style={styles.text}>Dollar Value:&nbsp;</Text>
                    <Text style={styles.value}>{project?.dollarMethod}</Text>
                </View>
                <View style={styles.key}>
                    <Text style={styles.text}>Discounting Convention:&nbsp;</Text>
                    <Text style={styles.value}>{project?.discountingMethod}</Text>
                </View>
            </>
            {project?.dollarMethod === DollarMethod.CONSTANT ? (
                <>
                    <View style={styles.key}>
                        <Text style={styles.text}>Real Discount Rate:&nbsp;</Text>
                        <Text style={styles.value}>{project?.realDiscountRate}%</Text>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.key}>
                        <Text style={styles.text}>Inflation Rate:&nbsp;</Text>
                        <Text style={styles.value}>{project?.inflationRate}%</Text>
                    </View>
                    <br />
                    <View style={styles.key}>
                        <Text style={styles.text}>Nominal Discount Rate:&nbsp;</Text>
                        <Text style={styles.value}>{project?.nominalDiscountRate}%</Text>
                    </View>
                    <br />
                </>
            )}
            <View>
                {/* <Text style={styles.text}>Location:</Text> */}
                <View style={styles.key}>
                    <Text style={styles.text}>Country:&nbsp;</Text>
                    <Text style={styles.value}>{project?.location.country}</Text>
                </View>
                <br />
                <View style={styles.key}>
                    <Text style={styles.text}>State:&nbsp;</Text>
                    <Text style={styles.value}>{(project?.location as USLocation).state}</Text>
                </View>
                <br />
                <View style={styles.key}>
                    <Text style={styles.text}>City:&nbsp;</Text>
                    <Text style={styles.value}>{project?.location.city}</Text>
                </View>
                <br />
                <View style={styles.key}>
                    <Text style={styles.text}>Zip:&nbsp;</Text>
                    <Text style={styles.value}>{(project?.location as USLocation).zipcode}</Text>
                </View>
                <br />
            </View>
            <View>
                {/* <Text style={styles.text}>Greenhouse Gas (GHG) Emissions and Cost Assumptions:</Text> */}
                <View style={styles.key}>
                    <Text style={styles.text}>Data Source:&nbsp;</Text>
                    <Text style={styles.value}>{project?.ghg.dataSource}</Text>
                </View>
                <br />
                <View style={styles.key}>
                    <Text style={styles.text}>Emissions Rate Type:&nbsp;</Text>
                    <Text style={styles.value}>{project?.ghg.emissionsRateType}</Text>
                </View>
                <br />
                <View style={styles.key}>
                    <Text style={styles.text}>Social Cost of GHG Scenario:&nbsp;</Text>
                    <Text style={styles.value}>{project?.ghg.socialCostOfGhgScenario}</Text>
                </View>
                <br />
            </View>
        </View>
    );
};

export default GeneralInformation;
