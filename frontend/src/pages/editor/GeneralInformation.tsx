import { Divider, Switch, Typography } from "antd";

import textInput, { TextInputType } from "../../components/TextInput";
import textArea from "../../components/TextArea";
import dropdown from "../../components/Dropdown";
import { countries, zipcodes } from "../../constants/LOCATION";
import { AnalysisType, Purpose } from "../../blcc-format/Format";
import { of } from "rxjs";
import { Model } from "../../model/Model";

const { Title } = Typography;

/*
 * rxjs components
 */
const { component: Input } = textInput();

const { onChange$: nameChange$, component: NameInput } = textInput(Model.name$, of("Untitled Project"));
const { onChange$: analystChange$, component: AnalystInput } = textInput(Model.analyst$);
const { onChange$: descriptionChange$, component: TextArea } = textArea();
const { component: DropDown } = dropdown(countries);
const { change$: analysisTypeChange$, component: AnalysisTypeDropdown } = dropdown(
    Object.values(AnalysisType),
    Model.analysisType$
);
const { change$: analysisPurposeChange$, component: AnalysisPurposeDropdown } = dropdown<Purpose>(
    Object.values(Purpose),
    Model.purpose$
);
//const { onChange$: stateChange$, component: StateInput } = textInput(Model.state$);
const { onChange$: cityChange$, component: CityInput } = textInput(Model.city$);

export { nameChange$, descriptionChange$, analystChange$, cityChange$, analysisTypeChange$, analysisPurposeChange$ };

const zip: number[] = [];
zipcodes.forEach((zips) => zip.push(zips.zip));

export default function GeneralInformation() {
    const studyPeriod: string[] = [];
    for (let i = 0; i < 41; i++) studyPeriod.push(i + " years");

    return (
        <div className={"w-full h-full p-8 "}>
            <div className="w-1/2 grid grid-cols-2">
                <span className="pb-3">
                    <Title level={5}>Project Name</Title>
                    <NameInput className="w-3/4" type={TextInputType.PRIMARY} />
                </span>
                <span>
                    <Title level={5}>Analyst</Title>
                    <AnalystInput className="w-3/4" type={TextInputType.PRIMARY} />
                </span>

                <span className="pb-3">
                    <Title level={5}>Analysis Type</Title>
                    <AnalysisTypeDropdown className={"w-3/4"} />
                </span>
                <span className="pb-3">
                    <Title level={5}>Analysis Purpose</Title>
                    <AnalysisPurposeDropdown className="w-3/4" placeholder={"N/A"} />
                </span>

                <span className="col-span-2 pb-3">
                    <Title level={5}>Description</Title>
                    <TextArea className="w-full" />
                </span>
                <span className="pb-3">
                    <Title level={5}>Length of Study Period</Title>
                    <DropDown className="w-3/4" />
                </span>
            </div>
            <span className="w-1/4 pb-3">
                <Title level={5}>Dollar Analysis</Title>
                <Switch className="" checkedChildren="Consant" unCheckedChildren="Current" defaultChecked />
            </span>
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
                        <Title level={5}>Discounting Convention</Title>
                        <DropDown className="w-3/4" />
                    </span>
                    <span className="pb-3">
                        <Title level={5}>General Inflation Rate</Title>
                        {/*<TextInput className="w-3/4" type={TextInputType.PRIMARY} />*/}
                    </span>
                    <span className="pb-3 w-full">
                        <Title level={5}>Nominal Discount Rate</Title>
                        {/*<TextInput className="w-3/4" type={TextInputType.PRIMARY} />*/}
                    </span>
                    <span>
                        <Title level={5}>Real Discount Rate</Title>
                        {/*<TextInput className="w-3/4" type={TextInputType.PRIMARY} />*/}
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
                        <DropDown className="w-3/4" />
                    </span>
                    <span>
                        <Title level={5}>City</Title>
                        <CityInput className="w-3/4" type={TextInputType.PRIMARY} />
                    </span>
                    <span className="pb-3">
                        <Title level={5}>State</Title>
                        <Input className="w-3/4" type={TextInputType.PRIMARY} />
                    </span>
                    <span>
                        <Title level={5}>Zip</Title>
                        <Input className="w-3/4" type={TextInputType.PRIMARY} />
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
                    <DropDown className="w-1/2" />
                </span>
                <span className="pb-3">
                    <Title level={5}>Social Cost of GHG Scenario </Title>
                    <DropDown className="w-1/2" />
                </span>
            </div>
        </div>
    );
}
