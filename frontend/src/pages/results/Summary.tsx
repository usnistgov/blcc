import { Divider, Typography } from "antd";
import { Model } from "../../model/Model";

const { Title } = Typography;

export default function Summary() {
    return (
        <div className={"w-full h-full"}>
            <div className="w-1/2 grid grid-cols-2">
                <span className="pb-3">
                    <Title level={5}>Project Name</Title>
                    <h2>{Model.useName()}</h2>
                </span>
                <span>
                    <Title level={5}>Analyst</Title>
                    <h2>{Model.useAnalyst()}</h2>
                </span>
                <span className="pb-3">
                    <Title level={5}>Analysis Type</Title>
                    <h2>{Model.useAnalysisType()}</h2>
                </span>
                {Model.useAnalysisType() === "OMB Analysis, Non-Energy Project" ? (
                    <span className="pb-3">
                        <Title level={5}>Analysis Purpose</Title>
                        <h2>{Model.usePurpose()}</h2>
                    </span>
                ) : (
                    ""
                )}
                <span className="col-span-2 pb-3">
                    <Title level={5}>Description</Title>
                    <h2>{Model.useDescription()}</h2>
                </span>
                <span className="pb-3">
                    <Title level={5}>Length of Study Period</Title>
                    <h2>{Model.useStudyPeriod()}</h2>
                </span>
                <span className="pb-3 pl-3">
                    <Title level={5}>Construction Period</Title>
                    <h2>{Model.useConstructionPeriod()}</h2>
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
                    <span className="flex">
                        <h1>Dollar Method: &nbsp;</h1>
                        <h2>{Model.useDollarMethod()}</h2>
                        <h2>{Model.useModifiedDollarMethod()}</h2>
                    </span>
                    <span className="pb-3">
                        <Title level={5}>Discounting Convention</Title>
                        <h2>{Model.useDiscountingMethod()}</h2>
                    </span>
                    <span className="pb-3">
                        <Title level={5}>General Inflation Rate</Title>
                        <h2>{Model.useInflationRate()}</h2>
                    </span>
                    <span className="pb-3 w-full">
                        <Title level={5}>Nominal Discount Rate</Title>
                        <h2>{Model.useNominalDiscountRate()}</h2>
                    </span>
                    <span>
                        <Title level={5}>Real Discount Rate</Title>
                        <h2>{Model.useRealDiscountRate()}</h2>
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
                        <h2>{Model.useCountry()}</h2>
                    </span>
                    <span>
                        <Title level={5}>City</Title>
                        <h2>{Model.useCity()}</h2>
                    </span>
                    <span className="pb-3">
                        <Title level={5}>State</Title>
                        <h2>{Model.useState()}</h2>
                    </span>

                    <span>
                        <Title level={5}>Zip</Title>
                        <h2>{Model.useZip()}</h2>
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
                    <h2>{Model.useEmissionsRate()}</h2>
                </span>
                <span className="pb-3">
                    <Title level={5}>Social Cost of GHG Scenario </Title>
                    <h2>{Model.useSocialCostRate()}</h2>
                </span>
            </div>
        </div>
    );
}
