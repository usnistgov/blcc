import { Typography, Divider } from "antd";

import textInput, { TextInputType } from "../../components/TextInput";
import textArea from "../../components/TextArea";
import dropdown from "../../components/Dropdown";

const { component: TextInput } = textInput();
const { component: TextArea } = textArea();
const { component: DropDown } = dropdown();

const { Title } = Typography;

export default function GeneralInformation() {
    const analysisType: string[] = [
        "Federal Analysis, Financed Project",
        "FEMP Analysis, Energy Project",
        "OMB Analysis, Non-Energy Project",
        "MILCON Analysis, Energy Project",
        "MILCON Analysis, Non-Energy Project",
        "MILCON Analysis, ECIP Project",
        "FEMP Analysis, ESPC Project "
    ];

    const analysisPurpose: string[] = [
        "Cost-effectiveness- lease-purchase- internal government investment & asset sales",
        "Public Investment & Regulatory Analyses"
    ];

    const studyPeriod: string[] = [];
    for (let i = 0; i < 41; i++) studyPeriod.push(i + " years");

    return (
        <div className={"w-full h-full bg-base p-8"}>
            <div className="w-1/2">
                <div className="flex">
                    <span className="">
                        <Title level={5}>Project Name</Title>
                        <TextInput type={TextInputType.PRIMARY} />
                    </span>
                    <span>
                        <Title level={5}>Analyst</Title>
                        <TextInput type={TextInputType.PRIMARY} />
                    </span>
                </div>
                <div className="flex ">
                    <span className="">
                        <Title level={5}>Analysis Type</Title>
                        <DropDown className="" options={analysisType} />
                    </span>
                    <span className="">
                        <Title level={5}>Analysis Purpose</Title>
                        <DropDown options={analysisPurpose} />
                    </span>
                </div>
                <span className="">
                    <Title level={5}>Description</Title>
                    <TextArea className="w-full" />
                </span>
                <span className="">
                    <Title level={5}>Length of Study Period</Title>
                    <DropDown options={studyPeriod} />
                </span>
            </div>

            <div className="flex">
                <div className="w-1/2">
                    <div className="">
                        <Divider orientation="left" orientationMargin="0">
                            Discounting
                        </Divider>
                        <div className="flex">
                            <span>
                                <Title level={5}>Discounting Convention</Title>
                                <DropDown options={["End of Year", "Mid Year"]} />
                            </span>
                            <span className="">
                                <Title level={5}>General Inflation Rate</Title>
                                <TextInput type={TextInputType.PRIMARY} />
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="flex">
                            <span className="">
                                <Title level={5}>Nominal Discount Rate</Title>
                                <TextInput type={TextInputType.PRIMARY} />
                            </span>
                            <span>
                                <Title level={5}>Real Discount Rate</Title>
                                <TextInput type={TextInputType.PRIMARY} />
                            </span>
                        </div>
                    </div>
                </div>
                <div className="w-1/2">
                    <div className="">
                        <Divider orientation="left" orientationMargin="0">
                            Location
                        </Divider>
                        <div className="flex">
                            <span className="">
                                <Title level={5}>Country</Title>
                                <TextInput type={TextInputType.PRIMARY} />
                            </span>
                            <span>
                                <Title level={5}>City</Title>
                                <TextInput type={TextInputType.PRIMARY} />
                            </span>
                        </div>
                    </div>
                    <div className="flex">
                        <span className="">
                            <Title level={5}>State</Title>
                            <TextInput type={TextInputType.PRIMARY} />
                        </span>
                        <span>
                            <Title level={5}>Zip</Title>
                            <TextInput type={TextInputType.PRIMARY} />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

