import { useStateObservable } from "@react-rxjs/core";
import { Divider } from "antd";
import Title from "antd/es/typography/Title";
import { Defaults } from "blcc-format/Defaults";
import { AnalysisType, DiscountingMethod, DollarMethod, Purpose } from "blcc-format/Format";
import Location from "components/Location";
import { Dropdown } from "components/input/Dropdown";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { TextArea } from "components/input/TextArea";
import TextInput, { TextInputType } from "components/input/TextInput";
import { motion } from "framer-motion";
import { Model } from "model/Model";
import { max, min } from "model/rules/Rules";
import DiscountRates from "pages/editor/general_information/DiscountRates";
import GhgInput from "pages/editor/general_information/GhgInput";
import { Strings } from "constants/Strings";
import Info from "components/Info";
import Nbsp from "util/Nbsp";
import { EiaProjectScenarioSelect } from "pages/editor/general_information/EiaProjectScenarioSelect";

export default function GeneralInformation() {
    //TODO make ghg values removable
    //TODO make location reset when switching to US vs non-US

    const constructionPeriod = useStateObservable(Model.constructionPeriod$);

    return (
        <motion.div
            className={"w-full h-full overflow-y-auto"}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
        >
            <div className={"max-w-screen-lg p-6 mb-16"}>
                <div className={" grid grid-cols-2 gap-x-16 gap-y-4"}>
                    <TextInput
                        label={
                            <>
                                Project Name
                                <Nbsp />*
                            </>
                        }
                        type={TextInputType.PRIMARY}
                        info={Strings.PROJECT_NAME}
                        placeholder={"Untitled Project"}
                        value$={Model.name$}
                        wire={Model.sName$}
                    />
                    <TextInput
                        label={"Analyst"}
                        type={TextInputType.PRIMARY}
                        info={Strings.ANALYST}
                        value$={Model.analyst$}
                        wire={Model.sAnalyst$}
                    />

                    <Dropdown
                        label={
                            <>
                                Analysis Type
                                <Nbsp />*
                            </>
                        }
                        className={"w-full"}
                        info={Strings.ANALYSIS_TYPE}
                        placeholder={"Please select an analysis type"}
                        options={Object.values(AnalysisType)}
                        wire={Model.sAnalysisType$}
                        value$={Model.analysisType$}
                    />
                    {useStateObservable(Model.analysisType$) === "OMB Analysis, Non-Energy Project" && (
                        <Dropdown
                            label={"Analysis Purpose"}
                            className={"w-full"}
                            info={Strings.ANALYSIS_PURPOSE}
                            options={Object.values(Purpose)}
                            wire={Model.sPurpose$}
                            value$={Model.purpose$}
                        />
                    )}

                    <span className={"col-span-2"}>
                        <TextArea
                            label={"Description"}
                            className={"w-full"}
                            info={Strings.DESCRIPTION}
                            value$={Model.description$}
                            wire={Model.sDescription$}
                        />
                    </span>
                    <div className={"col-span-2 grid grid-cols-4 gap-x-16 gap-y-4"}>
                        <NumberInput
                            label={
                                <>
                                    Study Period
                                    <Nbsp />*
                                </>
                            }
                            info={Strings.STUDY_PERIOD}
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
                            label={
                                <>
                                    Construction Period
                                    <Nbsp />*
                                </>
                            }
                            info={Strings.CONSTRUCTION_PERIOD}
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
                            label={
                                <>
                                    Data Release Year
                                    <Nbsp />*
                                </>
                            }
                            info={Strings.DATA_RELEASE_YEAR}
                            options={Model.releaseYears$}
                            wire={Model.sReleaseYear$}
                            value$={Model.releaseYear$}
                        />
                        <EiaProjectScenarioSelect/>
                    </div>
                </div>

                <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                    <div className={"grid grid-cols-2 gap-x-8 gap-y-2"}>
                        <Divider
                            className={"col-span-2 h-fit"}
                            style={{ fontSize: "20px" }}
                            orientation={"left"}
                            orientationMargin={"0"}
                        >
                            <Info text={Strings.DISCOUNTING}>Discounting</Info>
                        </Divider>
                        <div>
                            <Title level={5}>
                                <Info text={Strings.DOLLAR_ANALYSIS}>
                                    Constant/Current
                                    <br />
                                    Dollar Analysis
                                </Info>
                            </Title>
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
                        <Dropdown
                            label={
                                <>
                                    Discounting Convention
                                    <Nbsp />*
                                </>
                            }
                            className={"w-full"}
                            info={Strings.DISCOUNTING_CONVENTION}
                            placeholder={"Please select a discounting convention"}
                            options={Object.values(DiscountingMethod)}
                            wire={Model.sDiscountingMethod$}
                            value$={Model.discountingMethod$}
                        />
                        <DiscountRates />
                    </div>

                    <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                        <Divider
                            className={"col-span-2 h-fit"}
                            style={{ fontSize: "20px" }}
                            orientation={"left"}
                            orientationMargin={"0"}
                        >
                            <Info text={Strings.LOCATION}>Location</Info>
                        </Divider>
                        <Location
                            sCountry$={Model.Location.sCountry$}
                            country$={Model.Location.country$}
                            sCity$={Model.Location.sCity$}
                            city$={Model.Location.city$}
                            sState$={Model.Location.sState$}
                            state$={Model.Location.state$}
                            sZip$={Model.Location.sZip$}
                            zip$={Model.Location.zip$}
                            sStateOrProvince$={Model.Location.sStateOrProvince$}
                            stateOrProvince$={Model.Location.stateOrProvince$}
                        />
                    </div>
                </div>

                <GhgInput />
            </div>
        </motion.div>
    );
}
