import { Divider, Typography } from "antd";
import { Model } from "../../model/Model";

const { Title } = Typography;

export default function Summary() {
    return (
        <div className={"w-full h-full p-8"}>
            <div className="w-1/2 grid grid-cols-2">
                <span className="pb-3">
                    <Title level={5}>Project Name</Title>
                    <h2>{Model.useName() || "Untitled Project"}</h2>
                </span>
                <span>
                    <Title level={5}>Analyst</Title>
                    <h2>{Model.useAnalyst() || "Unknown"}</h2>
                </span>
                <span className="pb-3">
                    <Title level={5}>Analysis Type</Title>
                    <h2>{Model.useAnalysisType() || "Unknown"}</h2>
                </span>
                {Model.useAnalysisType() === "OMB Analysis, Non-Energy Project" ? (
                    <span className="pb-3">
                        <Title level={5}>Analysis Purpose</Title>
                        <h2>{Model.usePurpose() || "Unknown"}</h2>
                    </span>
                ) : (
                    ""
                )}
                <span className="col-span-2 pb-3">
                    <Title level={5}>Description</Title>
                    <h2>{Model.useDescription() || "None"}</h2>
                </span>
                <span className="pb-3">
                    <Title level={5}>Length of Study Period</Title>
                    <h2>{Model.useStudyPeriod() || "Unknown"}</h2>
                </span>
                <span className="pb-3 pl-3">
                    <Title level={5}>Construction Period</Title>
                    <h2>{Model.useConstructionPeriod() || "Unknown"}</h2>
                </span>
            </div>

            <div className="grid grid-cols-2">
                <div className="grid grid-cols-2">
                    <Divider
                        className="col-span-2 pb-3"
                        style={{ fontSize: "20px" }}
                        orientation="left"
                        orientationMargin="0"
                    >
                        Discounting
                    </Divider>
                    <span className="pb-3">
                        <Title level={5}>Dollar Method</Title>
                        <h2>{Model.useDollarMethod() || "Unknown"}</h2>
                        {/* <h2>{Model.useModifiedDollarMethod() || "Unknown"}</h2> */}
                    </span>
                    <span className="pb-3">
                        <Title level={5}>Discounting Convention</Title>
                        <h2>{Model.useDiscountingMethod() || "Unknown"}</h2>
                    </span>
                    <span className="pb-3">
                        <Title level={5}>General Inflation Rate</Title>
                        <h2>{Model.useInflationRate() || "Unknown"}</h2>
                    </span>
                    <span className="pb-3 w-full">
                        <Title level={5}>Nominal Discount Rate</Title>
                        <h2>{Model.useNominalDiscountRate() || "Unknown"}</h2>
                    </span>
                    <span>
                        <Title level={5}>Real Discount Rate</Title>
                        <h2>{Model.useRealDiscountRate() || "Unknown"}</h2>
                    </span>
                </div>
                <div className="grid grid-cols-2">
                    <Divider
                        className="col-span-2 pb-3"
                        style={{ fontSize: "20px" }}
                        orientation="left"
                        orientationMargin="0"
                    >
                        Location
                    </Divider>
                    <span className="pb-3">
                        <Title level={5}>Country</Title>
                        <h2>{Model.useCountry() || "Unknown"}</h2>
                    </span>
                    <span>
                        <Title level={5}>City</Title>
                        <h2>{Model.useCity() || "Unknown"}</h2>
                    </span>
                    <span className="pb-3">
                        <Title level={5}>State</Title>
                        <h2>{Model.useState() || "Unknown"}</h2>
                    </span>

                    <span>
                        <Title level={5}>Zip</Title>
                        <h2>{Model.useZip() || "Unknown"}</h2>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2">
                <Divider
                    className="col-span-2 pb-3"
                    style={{ fontSize: "20px" }}
                    orientation="left"
                    orientationMargin="0"
                >
                    Greenhouse Gas (GHG) Emissions and Cost Assumptions
                </Divider>
                <span className="pb-3">
                    <Title level={5}>Emissions Rate Scenario</Title>
                    <h2>{Model.useEmissionsRate() || "Unknown"}</h2>
                </span>
                <span className="pb-3">
                    <Title level={5}>Social Cost of GHG Scenario </Title>
                    <h2>{Model.useSocialCostRate() || "Unknown"}</h2>
                </span>
            </div>
        </div>
    );
}
