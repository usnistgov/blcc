import { useStateObservable } from "@react-rxjs/core";
import { Divider } from "antd";
import Title from "antd/es/typography/Title";
import { Defaults } from "blcc-format/Defaults";
import {
    AnalysisType,
    DiscountingMethod,
    DollarMethod,
    EmissionsRateScenario,
    Purpose,
    SocialCostOfGhgScenario,
} from "blcc-format/Format";
import { Dropdown } from "components/input/Dropdown";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { TextArea } from "components/input/TextArea";
import TextInput, { TextInputType } from "components/input/TextInput";
import { Country, State } from "constants/LOCATION";
import { motion } from "framer-motion";
import { Model } from "model/Model";
import { max, min } from "model/rules/Rules";

export default function GeneralInformation() {
    //TODO make ghg values removable
    //TODO make location reset when switching to US vs non-US

    const dollarMethod = useStateObservable(Model.dollarMethod$);
    const country = useStateObservable(Model.Location.country$);
    const constructionPeriod = useStateObservable(Model.constructionPeriod$);

    return (
        <motion.div
            className={"max-w-screen-lg p-6"}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
        >
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <TextInput
                    label={"Project Name *"}
                    type={TextInputType.PRIMARY}
                    placeholder={"Untitled Project"}
                    value$={Model.name$}
                    wire={Model.sName$}
                />
                <TextInput
                    label={"Analyst"}
                    type={TextInputType.PRIMARY}
                    value$={Model.analyst$}
                    wire={Model.sAnalyst$}
                />

                <Dropdown
                    label={"Analysis Type *"}
                    className={"w-full"}
                    placeholder={"Please select an analysis type"}
                    options={Object.values(AnalysisType)}
                    wire={Model.sAnalysisType$}
                    value$={Model.analysisType$}
                />
                {useStateObservable(Model.analysisType$) === "OMB Analysis, Non-Energy Project" && (
                    <Dropdown
                        label={"Analysis Purpose"}
                        className={"w-full"}
                        options={Object.values(Purpose)}
                        wire={Model.sPurpose$}
                        value$={Model.purpose$}
                    />
                )}

                <span className={"col-span-2"}>
                    <TextArea
                        label={"Description"}
                        className={"w-full"}
                        value$={Model.description$}
                        wire={Model.sDescription$}
                    />
                </span>
                <div className={"col-span-2 grid grid-cols-3 gap-x-16 gap-y-4"}>
                    <NumberInput
                        label={"Study Period*"}
                        addonAfter={"years"}
                        defaultValue={0}
                        max={Defaults.STUDY_PERIOD + constructionPeriod}
                        min={0}
                        controls={true}
                        allowEmpty
                        rules={[max(Defaults.STUDY_PERIOD + constructionPeriod), min(0)]}
                        wire={Model.sStudyPeriod$}
                        value$={Model.studyPeriod$}
                        parser={(input) => (input ? Math.trunc(Number.parseInt(input)) : 0)}
                    />
                    <NumberInput
                        label={"Construction Period*"}
                        addonAfter={"years"}
                        defaultValue={0}
                        max={Defaults.CONSTRUCTION_PERIOD}
                        min={0}
                        controls={true}
                        wire={Model.sConstructionPeriod$}
                        value$={Model.constructionPeriod$}
                        parser={(input) => (input ? Math.trunc(Number.parseInt(input)) : 0)}
                    />

                    <Dropdown
                        className={"w-full"}
                        label={"Data Release Year *"}
                        options={Model.releaseYears$}
                        wire={Model.sReleaseYear$}
                        value$={Model.releaseYear$}
                    />
                </div>
            </div>
            <div className={"pt-4"}>
                <Title level={5}>Dollar Analysis</Title>
                <Switch
                    left={DollarMethod.CURRENT}
                    right={DollarMethod.CONSTANT}
                    className={"bg-primary hover:bg-primary"}
                    value$={Model.dollarMethod$}
                    wire={Model.sDollarMethod$}
                    checkedChildren={"Constant"}
                    unCheckedChildren={"Current"}
                    defaultChecked
                />
            </div>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <div className={"grid grid-cols-2"}>
                    <Divider
                        className={"col-span-2"}
                        style={{ fontSize: "20px" }}
                        orientation={"left"}
                        orientationMargin={"0"}
                    >
                        Discounting
                    </Divider>
                    <div className={"col-span-2"}>
                        {
                            <Dropdown
                                label={"Discounting Convention *"}
                                placeholder={"Please select a discounting convention"}
                                options={Object.values(DiscountingMethod)}
                                wire={Model.sDiscountingMethod$}
                                value$={Model.discountingMethod$}
                            />
                        }
                    </div>
                    <div className={"col-span-2 grid grid-cols-3 items-end gap-x-16 gap-y-4"}>
                        <NumberInput
                            label={"Inflation Rate*"}
                            disabled={dollarMethod !== DollarMethod.CURRENT}
                            addonAfter={"%"}
                            allowEmpty={true}
                            controls={false}
                            wire={Model.sInflationRate$}
                            value$={Model.inflationRate$}
                        />
                        <NumberInput
                            label={"Nominal Discount Rate*"}
                            disabled={dollarMethod !== DollarMethod.CURRENT}
                            addonAfter={"%"}
                            allowEmpty={true}
                            controls={false}
                            min={0.0}
                            wire={Model.sNominalDiscountRate$}
                            value$={Model.nominalDiscountRate$}
                        />
                        <NumberInput
                            label={"Real Discount Rate*"}
                            disabled={dollarMethod !== DollarMethod.CONSTANT}
                            addonAfter={"%"}
                            allowEmpty={true}
                            controls={false}
                            min={0.0}
                            wire={Model.sRealDiscountRate$}
                            value$={Model.realDiscountRate$}
                        />
                    </div>
                </div>
                <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                    <Divider
                        className={"col-span-2"}
                        style={{ fontSize: "20px" }}
                        orientation={"left"}
                        orientationMargin={"0"}
                    >
                        Location
                    </Divider>
                    <Dropdown
                        label={"Country"}
                        className={"w-full"}
                        options={Object.values(Country)}
                        wire={Model.Location.sCountry$}
                        value$={Model.Location.country$}
                    />
                    <TextInput
                        label={"City"}
                        type={TextInputType.PRIMARY}
                        value$={Model.Location.city$}
                        wire={Model.Location.sCity$}
                    />
                    {country === Country.USA ? (
                        <Dropdown
                            label={"State"}
                            className={"w-full"}
                            options={Object.values(State)}
                            wire={Model.Location.sState$}
                            value$={Model.Location.state$}
                        />
                    ) : (
                        <TextInput
                            label={"State"}
                            type={TextInputType.PRIMARY}
                            value$={Model.Location.stateOrProvince$}
                            wire={Model.Location.sStateOrProvince$}
                        />
                    )}
                    {country === Country.USA && (
                        <TextInput
                            label={"Zip *"}
                            type={TextInputType.PRIMARY}
                            value$={Model.Location.zip$}
                            wire={Model.Location.sZip$}
                            maxLength={5}
                        />
                    )}
                </div>
            </div>

            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <Divider
                    className={"col-span-2"}
                    style={{ fontSize: "20px" }}
                    orientation={"left"}
                    orientationMargin={"0"}
                >
                    Greenhouse Gas (GHG) Emissions and Cost Assumptions
                </Divider>
                <Dropdown
                    label={"Emissions Rate Scenario *"}
                    className={"w-full"}
                    options={Object.values(EmissionsRateScenario)}
                    wire={Model.sEmissionsRateScenario$}
                    value$={Model.emissionsRateScenario$}
                />
                <Dropdown
                    label={"Social Cost of GHG Scenario *"}
                    className={"w-full"}
                    options={Object.values(SocialCostOfGhgScenario)}
                    wire={Model.sSocialCostOfGhgScenario$}
                    value$={Model.socialCostOfGhgScenario$}
                />
            </div>
        </motion.div>
    );
}
