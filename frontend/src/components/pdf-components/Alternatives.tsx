import { StyleSheet, Text, View } from "@react-pdf/renderer";
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

const Alternatives = () => {
    return (
        <View style={styles.section}>
            <Text style={styles.title}>Alternatives</Text>
            <View style={styles.key}>
                <Text style={styles.text}>Name:&nbsp;</Text>
                <Text style={styles.value}>{}</Text>
            </View>
            <View style={styles.key}>
                <Text style={styles.text}>Baseline Alternative:&nbsp;</Text>
                <Text style={styles.value}>{}</Text>
            </View>
            <br />
            {/* {project?.projectDesc?.length !== 0 ? ( */}
            <View style={styles.desc}>
                <Text style={styles.text}>Description:&nbsp;</Text>
                <Text style={styles.value}>{}</Text>
                <br />
            </View>
            {/* ) : null} */}
            <View style={styles.key}>
                <Text style={styles.text}>Alternative Costs&nbsp;</Text>
                <Text style={styles.value}>{} year(s)</Text>
            </View>
            <br />
            <View style={styles.key}>
                <Text style={styles.text}>Energy Costs:&nbsp;</Text>
                <Text style={styles.value}>{}</Text>
                <View>
                    {/* <Text style={styles.text}>Location:</Text> */}
                    <View style={styles.key}>
                        <Text style={styles.text}>Country:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                    <View style={styles.key}>
                        <Text style={styles.text}>State:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                    <View style={styles.key}>
                        <Text style={styles.text}>City:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                    <View style={styles.key}>
                        <Text style={styles.text}>Zip:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                </View>
            </View>
            <br />
            <View style={styles.key}>
                <Text style={styles.text}>Water Costs:&nbsp;</Text>
                <Text style={styles.value}>{}</Text>
                <View>
                    {/* <Text style={styles.text}>Location:</Text> */}
                    <View style={styles.key}>
                        <Text style={styles.text}>Country:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                    <View style={styles.key}>
                        <Text style={styles.text}>State:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                    <View style={styles.key}>
                        <Text style={styles.text}>City:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                    <View style={styles.key}>
                        <Text style={styles.text}>Zip:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                </View>
            </View>
            <br />
            <View style={styles.key}>
                <Text style={styles.text}>Capital Costs:&nbsp;</Text>
                <Text style={styles.value}>{}</Text>
                <View>
                    {/* <Text style={styles.text}>Location:</Text> */}
                    <View style={styles.key}>
                        <Text style={styles.text}>Country:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                    <View style={styles.key}>
                        <Text style={styles.text}>State:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                    <View style={styles.key}>
                        <Text style={styles.text}>City:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                    <View style={styles.key}>
                        <Text style={styles.text}>Zip:&nbsp;</Text>
                        <Text style={styles.value}>{}</Text>
                    </View>
                    <br />
                </View>
            </View>
            <br />

            <>
                <View style={styles.key}>
                    <Text style={styles.text}>Contract Costs:&nbsp;</Text>
                    <Text style={styles.value}>Constant</Text>
                    <View>
                        <View style={styles.key}>
                            <Text style={styles.text}>Country:&nbsp;</Text>
                            <Text style={styles.value}>{}</Text>
                        </View>
                        <br />
                        <View style={styles.key}>
                            <Text style={styles.text}>State:&nbsp;</Text>
                            <Text style={styles.value}>{}</Text>
                        </View>
                        <br />
                        <View style={styles.key}>
                            <Text style={styles.text}>City:&nbsp;</Text>
                            <Text style={styles.value}>{}</Text>
                        </View>
                        <br />
                        <View style={styles.key}>
                            <Text style={styles.text}>Zip:&nbsp;</Text>
                            <Text style={styles.value}>{}</Text>
                        </View>
                        <br />
                    </View>
                </View>
                <View style={styles.key}>
                    <Text style={styles.text}>Other Costs:&nbsp;</Text>
                    <Text style={styles.value}>{}</Text>
                    <View>
                        <View style={styles.key}>
                            <Text style={styles.text}>Country:&nbsp;</Text>
                            <Text style={styles.value}>{}</Text>
                        </View>
                        <br />
                        <View style={styles.key}>
                            <Text style={styles.text}>State:&nbsp;</Text>
                            <Text style={styles.value}>{}</Text>
                        </View>
                        <br />
                        <View style={styles.key}>
                            <Text style={styles.text}>City:&nbsp;</Text>
                            <Text style={styles.value}>{}</Text>
                        </View>
                        <br />
                        <View style={styles.key}>
                            <Text style={styles.text}>Zip:&nbsp;</Text>
                            <Text style={styles.value}>{}</Text>
                        </View>
                        <br />
                    </View>
                </View>
                <br />
            </>
        </View>
    );
};

export default Alternatives;
