import { Typography, Divider, Switch } from "antd";

import textInput, { TextInputType } from "../../components/TextInput";
import textArea from "../../components/TextArea";
import dropdown from "../../components/Dropdown";

import { analysisType, analysisPurpose, emissionsRateScenario, socialCostOfGHG } from "../../constants/DROPDOWN";

const { component: TextInput } = textInput();
const { component: TextArea } = textArea();
const { component: DropDown } = dropdown();

const { Title } = Typography;

export default function GeneralInformation() {
    const studyPeriod: string[] = [];
    for (let i = 0; i < 41; i++) studyPeriod.push(i + " years");

    return (
        <div className={"w-full h-full bg-base p-8 "}>
            <div className="w-1/2 grid grid-cols-2">
                <span className="pb-3">
                    <Title level={5}>Project Name</Title>
                    <TextInput type={TextInputType.PRIMARY} />
                </span>
                <span>
                    <Title level={5}>Analyst</Title>
                    <TextInput type={TextInputType.PRIMARY} />
                </span>

                <span className="pb-3">
                    <Title level={5}>Analysis Type</Title>
                    <DropDown className="w-3/4" options={analysisType} />
                </span>
                <span className="pb-3">
                    <Title level={5}>Analysis Purpose</Title>
                    <DropDown className="w-3/4" options={analysisPurpose} />
                </span>

                <span className="col-span-2 pb-3">
                    <Title level={5}>Description</Title>
                    <TextArea className="w-full" />
                </span>
                <span className="pb-3">
                    <Title level={5}>Length of Study Period</Title>
                    <DropDown className="w-1/2" options={studyPeriod} />
                </span>
            </div>
            <span className="w-1/4 pb-3">
                <Title level={5}>Dollar Analysis</Title>
                <Switch className="" checkedChildren="Consant" unCheckedChildren="Current" defaultChecked />
            </span>
            <div className="grid grid-cols-2">
                <div className="grid grid-cols-2">
                    <Divider className="col-span-2 pb-3" orientation="left" orientationMargin="0">
                        Discounting
                    </Divider>
                    <span className="pb-3">
                        <Title level={5}>Discounting Convention</Title>
                        <DropDown className="w-1/2" options={["End of Year", "Mid Year"]} />
                    </span>
                    <span className="pb-3">
                        <Title level={5}>General Inflation Rate</Title>
                        <TextInput type={TextInputType.PRIMARY} />
                    </span>
                    <span className="pb-3 w-full">
                        <Title level={5}>Nominal Discount Rate</Title>
                        <TextInput type={TextInputType.PRIMARY} />
                    </span>
                    <span>
                        <Title level={5}>Real Discount Rate</Title>
                        <TextInput type={TextInputType.PRIMARY} />
                    </span>
                </div>
                <div className="grid grid-cols-2">
                    <Divider className="col-span-2 pb-3" orientation="left" orientationMargin="0">
                        Location
                    </Divider>
                    <span className="pb-3">
                        <Title level={5}>Country</Title>
                        <TextInput type={TextInputType.PRIMARY} />
                    </span>
                    <span>
                        <Title level={5}>City</Title>
                        <TextInput type={TextInputType.PRIMARY} />
                    </span>
                    <span className="pb-3">
                        <Title level={5}>State</Title>
                        <TextInput type={TextInputType.PRIMARY} />
                    </span>
                    <span>
                        <Title level={5}>Zip</Title>
                        <TextInput type={TextInputType.PRIMARY} />
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2">
                <Divider className="col-span-2 pb-3" orientation="left" orientationMargin="0">
                    Greenhouse Gas (GHG) Emissions and Cost Assumptions
                </Divider>
                <span className="pb-3">
                    <Title level={5}>Emissions Rate Scenario</Title>
                    <DropDown className="w-1/2" options={emissionsRateScenario} />
                </span>
                <span className="pb-3">
                    <Title level={5}>Social Cost of GHG Scenario </Title>
                    <DropDown className="w-1/2" options={socialCostOfGHG} />
                </span>
            </div>
        </div>
    );
}
