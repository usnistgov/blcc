import { state, useStateObservable } from "@react-rxjs/core";
import { Divider } from "antd";
import Title from "antd/es/typography/Title";
import { motion } from "framer-motion";
import { map } from "rxjs/operators";
import { match } from "ts-pattern";
import {
    AnalysisType,
    DiscountingMethod,
    DollarMethod,
    EmissionsRateScenario,
    Purpose,
    SocialCostOfGhgScenario,
} from "../../blcc-format/Format";
import { Dropdown } from "../../components/Dropdown";
import numberInput, { NumberInput } from "../../components/InputNumber";
import Switch from "../../components/Switch";
import { TextArea } from "../../components/TextArea";
import TextInput, { TextInputType } from "../../components/TextInput";
import { Country, State } from "../../constants/LOCATION";
import { useDbUpdate } from "../../hooks/UseDbUpdate";
import {
    Model,
    analyst$,
    constructionPeriod$,
    currentProject$,
    description$,
    dollarMethod$,
    inflationRate$,
    name$,
    nominalDiscountRate$,
    realDiscountRate$,
    sAnalyst$,
    sDescription$,
    sDollarMethodChange$,
    sName$,
    sStudyPeriodChange,
    studyPeriod$,
    useDollarMethod,
} from "../../model/Model";
import { db } from "../../model/db";
import { max, min } from "../../model/rules/Rules";
import { defaultValue } from "../../util/Operators";

/*
 * rxjs components
 */
const { onChange$: studyPeriodChange$, component: StudyPeriodInput } = numberInput(
    "Study Period *",
    "/editor#Study-Period-*",
    studyPeriod$,
    true,
    [max(40)],
);
const { onChange$: constructionPeriodChange$, component: ConstructionPeriodInput } = numberInput(
    "Construction Period *",
    "/editor#Construction-Period-*",
    constructionPeriod$,
);
const dollarMethod2$ = state(
    dollarMethod$.pipe(
        map((method) =>
            match(method)
                .with(DollarMethod.CONSTANT, () => true)
                .otherwise(() => false),
        ),
    ),
    false,
);

const { onChange$: inflationChange$, component: GenInflationRate } = numberInput(
    "Inflation Rate *",
    "/editor#Inflation-Rate-*",
    inflationRate$,
    true,
);
const { onChange$: nomDiscChange$, component: NominalDiscRate } = numberInput(
    "Nominal Discount Rate *",
    "/editor#Nominal-Discount-Rate-*",
    nominalDiscountRate$,
    true,
);
const { onChange$: realDiscChange$, component: RealDiscRate } = numberInput(
    "Real Discount Rate *",
    "/editor#Real-Discount-Rate-*",
    realDiscountRate$,
    true,
);

const projectCollection$ = currentProject$.pipe(map((id) => db.projects.where("id").equals(id)));

export default function GeneralInformation() {
    const dollarMethod = useDollarMethod();

    useDbUpdate(studyPeriodChange$, projectCollection$, "studyPeriod");
    useDbUpdate(constructionPeriodChange$, projectCollection$, "constructionPeriod");
    useDbUpdate(sDollarMethodChange$, projectCollection$, "dollarMethod");
    useDbUpdate(inflationChange$.pipe(defaultValue(undefined)), projectCollection$, "inflationRate");
    useDbUpdate(nomDiscChange$.pipe(defaultValue(undefined)), projectCollection$, "nominalDiscountRate");
    useDbUpdate(realDiscChange$.pipe(defaultValue(undefined)), projectCollection$, "realDiscountRate");

    //TODO make ghg values removable
    //TODO make location reset when switching to US vs non-US

    const country = useStateObservable(Model.Location.country$);

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
                    value$={name$}
                    wire={sName$}
                />
                <TextInput label={"Analyst"} type={TextInputType.PRIMARY} value$={analyst$} wire={sAnalyst$} />

                <Dropdown
                    label={"Analysis Type *"}
                    className={"w-full"}
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
                    <TextArea label={"Description"} className={"w-full"} value$={description$} wire={sDescription$} />
                </span>
                <div className={"col-span-2 grid grid-cols-3 gap-x-16 gap-y-4"}>
                    <NumberInput
                        label={"Study Period*"}
                        addonAfter={"years"}
                        defaultValue={0}
                        max={40}
                        min={0}
                        controls={true}
                        allowEmpty
                        rules={[max(40), min(0)]}
                        wire={sStudyPeriodChange}
                        value$={studyPeriod$}
                    />
                    <ConstructionPeriodInput addonAfter={"years"} defaultValue={0} max={40} min={0} controls={true} />

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
                    value$={dollarMethod$}
                    wire={sDollarMethodChange$}
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
                                options={Object.values(DiscountingMethod)}
                                wire={Model.sDiscountingMethod$}
                                value$={Model.discountingMethod$}
                            />
                        }
                    </div>
                    <div className={"col-span-2 grid grid-cols-3 items-end gap-x-16 gap-y-4"}>
                        <GenInflationRate
                            disabled={dollarMethod !== DollarMethod.CURRENT}
                            addonAfter={"%"}
                            controls={false}
                        />
                        <NominalDiscRate
                            disabled={dollarMethod !== DollarMethod.CURRENT}
                            addonAfter={"%"}
                            controls={false}
                            min={0.0}
                        />
                        <RealDiscRate
                            disabled={dollarMethod !== DollarMethod.CONSTANT}
                            addonAfter={"%"}
                            controls={false}
                            min={0.0}
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
