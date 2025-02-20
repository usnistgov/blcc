import { Divider, Radio } from "antd";
import Title from "antd/es/typography/Title";
import { AnalysisType, DiscountingMethod, DollarMethod, Purpose } from "blcc-format/Format";
import Info from "components/Info";
import Location from "components/Location";
import { TestInput } from "components/input/TestInput";
import { TestNumberInput } from "components/input/TestNumberInput";
import { TestSelect } from "components/input/TestSelect";
import { TestTextArea } from "components/input/TestTextArea";
import UpdateGeneralOptionsModal from "components/modal/UpdateGeneralOptionsModal";
import { Strings } from "constants/Strings";
import { motion } from "framer-motion";
import { useSubscribe } from "hooks/UseSubscribe";
import { Model } from "model/Model";
import DiscountRates from "pages/editor/general_information/DiscountRates";
import { EiaProjectScenarioSelect } from "pages/editor/general_information/EiaProjectScenarioSelect";
import GhgInput from "pages/editor/general_information/GhgInput";

/**
 * Returns a dropdown for selecting the analysis purpose if the analysis type is OMB Non-Energy,
 * otherwise returns nothing.
 *
 * @returns A dropdown with options for selecting the analysis purpose.
 */
function AnalysisPurpose() {
    if (Model.analysisType.use() !== AnalysisType.OMB_NON_ENERGY) return;

    return (
        <TestSelect
            className={"w-full"}
            label={"Analysis Purpose"}
            id={"analysisPurpose"}
            placeholder={"Select Analysis Purpose"}
            info={Strings.ANALYSIS_PURPOSE}
            options={Object.values(Purpose)}
            getter={Model.purpose.use}
            onChange={(change) => Model.purpose.set(change)}
        />
    );
}

export default function GeneralInformation() {
    useSubscribe(Model.updateAnalysisType$);

    return (
        <motion.div
            className={"h-full w-full overflow-y-auto"}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.08 }}
        >
            <UpdateGeneralOptionsModal />

            <div className={"mb-16 max-w-screen-lg p-6"}>
                <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                    {/* Project Name */}
                    <TestInput
                        id={"general-information:project-name"}
                        name={"projectName"}
                        label={"Project Name"}
                        info={Strings.PROJECT_NAME}
                        required
                        placeholder={"Untitled Project"}
                        getter={Model.name.use}
                        onChange={(event) => {
                            const change = event.currentTarget.value;
                            Model.name.set(change === "" ? undefined : change);
                        }}
                        showCount
                        maxLength={50}
                        error={Model.name.useValidation}
                    />

                    {/* Analyst */}
                    <TestInput
                        name={"analyst"}
                        label={"Analyst"}
                        info={Strings.ANALYST}
                        getter={Model.analyst.use}
                        onChange={(event) => {
                            const change = event.currentTarget.value;
                            Model.analyst.set(change === "" ? undefined : change);
                        }}
                        showCount
                        maxLength={50}
                        error={Model.analyst.useValidation}
                    />

                    {/* Analysis Type */}
                    <TestSelect
                        className={"w-full"}
                        label={"Analysis Type"}
                        id={"analysisType"}
                        info={Strings.ANALYSIS_TYPE}
                        required
                        placeholder={"Please select an analysis type"}
                        options={Object.values(AnalysisType)}
                        getter={Model.analysisType.use}
                        onChange={(change) => {
                            Model.analysisType.set(change);

                            if (change !== AnalysisType.OMB_NON_ENERGY) Model.purpose.set(undefined);
                        }}
                    />

                    {/* Analysis Purpose */}
                    <AnalysisPurpose />

                    {/* Description */}
                    <span className={"col-span-2"}>
                        <TestTextArea
                            name={"description"}
                            label={"Description"}
                            className={"w-full"}
                            info={Strings.DESCRIPTION}
                            getter={Model.description.use}
                            onChange={(event) => Model.description.set(event.currentTarget.value)}
                        />
                    </span>
                    <div className={"col-span-2 grid grid-cols-4 gap-x-16 gap-y-4"}>
                        <TestNumberInput
                            className={"w-full"}
                            getter={Model.studyPeriod.use}
                            label={"Study Period"}
                            name={"studyPeriod"}
                            required
                            info={Strings.STUDY_PERIOD}
                            onChange={(event) => Model.studyPeriod.set(event ?? 0)}
                        />
                        <TestNumberInput
                            className={"w-full"}
                            required
                            getter={Model.constructionPeriod.use}
                            label={"Construction Period"}
                            name={"constructionPeriod"}
                            info={Strings.CONSTRUCTION_PERIOD}
                            onChange={(event) => Model.constructionPeriod.set(event ?? 0)}
                        />
                        <TestSelect
                            className={"w-full"}
                            label={"Data Release Year"}
                            info={Strings.DATA_RELEASE_YEAR}
                            required
                            optionGetter={Model.useReleaseYearList}
                            getter={Model.releaseYear.use}
                            onChange={(releaseYear) => Model.releaseYear.set(releaseYear)}
                        />
                        <EiaProjectScenarioSelect />
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
                            <Radio.Group
                                onChange={(e) => Model.dollarMethod.set(e.target.value)}
                                value={Model.dollarMethod.use()}
                                buttonStyle="solid"
                            >
                                <Radio.Button value={DollarMethod.CONSTANT}>{DollarMethod.CONSTANT}</Radio.Button>
                                <Radio.Button value={DollarMethod.CURRENT}>{DollarMethod.CURRENT}</Radio.Button>
                            </Radio.Group>
                        </div>
                        <TestSelect
                            label={"Discounting Convention"}
                            required
                            className={"w-full"}
                            info={Strings.DISCOUNTING_CONVENTION}
                            placeholder={"Please select a discounting convention"}
                            options={Object.values(DiscountingMethod)}
                            getter={Model.discountingMethod.use}
                            onChange={(change) => Model.discountingMethod.set(change)}
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
                        <Location model={Model.Location} />
                    </div>
                </div>

                {/* Greenhouse Gas Inputs */}
                <GhgInput />
            </div>
        </motion.div>
    );
}
