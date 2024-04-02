import { Divider } from "antd";
import textInput, { TextInputType } from "../../components/TextInput";
import {
    analysisType$,
    analyst$,
    city$,
    constructionPeriod$,
    country$,
    currentProject$,
    description$,
    discountingMethod$,
    dollarMethod$,
    emissionsRate$,
    inflationRate$,
    name$,
    nominalDiscountRate$,
    purpose$,
    realDiscountRate$,
    releaseYear$,
    releaseYears$,
    socialCostOfGhgScenario$,
    state$,
    stateOrProvince$,
    studyPeriod$,
    useAnalysisType,
    useCountry,
    zip$
} from "../../model/Model";
import Title from "antd/es/typography/Title";
import { db } from "../../model/db";
import { map, withLatestFrom } from "rxjs/operators";
import { defaultValue } from "../../util/Operators";
import { useDbUpdate } from "../../hooks/UseDbUpdate";
import textArea from "../../components/TextArea";
import {
    AnalysisType,
    DiscountingMethod,
    DollarMethod,
    EmissionsRateScenario,
    Project,
    Purpose,
    SocialCostOfGhgScenario
} from "../../blcc-format/Format";
import dropdown from "../../components/Dropdown";
import { useSubscribe } from "../../hooks/UseSubscribe";
import { Collection } from "dexie";
import numberInput from "../../components/InputNumber";
import switchComp from "../../components/Switch";
import { Country, State } from "../../constants/LOCATION";
import { max } from "../../model/rules/Rules";

const DollarMethodReverse = {
    [DollarMethod.CONSTANT]: true,
    [DollarMethod.CURRENT]: false
};

/*
 * rxjs components
 */
const { onChange$: nameChange$, component: NameInput } = textInput(name$);
const { onChange$: analystChange$, component: AnalystInput } = textInput(analyst$);
const { onChange$: descriptionChange$, component: DescInput } = textArea(description$);
const { change$: analysisTypeChange$, component: AnalysisTypeDropdown } = dropdown(
    Object.values(AnalysisType),
    analysisType$
);
const { change$: purposeChange$, component: AnalysisPurposeDropdown } = dropdown(Object.values(Purpose), purpose$);
const { onChange$: studyPeriodChange$, component: StudyPeriodInput } = numberInput(
    "Study Period",
    "/editor#Study-Period",
    studyPeriod$,
    true,
    [max(40)]
);
const { onChange$: constructionPeriodChange$, component: ConstructionPeriodInput } = numberInput(
    "Construction Period",
    "/editor#Construction-Period",
    constructionPeriod$
);
const { onChange$: dollarMethodChange$, component: DollarMethodSwitch } = switchComp(
    dollarMethod$.pipe(map((method) => DollarMethodReverse[method]))
);
const { onChange$: inflationChange$, component: GenInflationRate } = numberInput(
    "Inflation Rate",
    "/editor#Inflation-Rate",
    inflationRate$,
    true
);
const { onChange$: nomDiscChange$, component: NominalDiscRate } = numberInput(
    "Nominal Discount Rate",
    "/editor#Nominal-Discount-Rate",
    nominalDiscountRate$,
    true
);
const { onChange$: realDiscChange$, component: RealDiscRate } = numberInput(
    "Real Discount Rate",
    "/editor#Real-Discount-Rate",
    realDiscountRate$,
    true
);
const { change$: discountingMethodChange$, component: DiscountingConvention } = dropdown(
    Object.values(DiscountingMethod),
    discountingMethod$
);

const { change$: countryChange$, component: CountryDropdown } = dropdown(Object.values(Country), country$);
const { onChange$: stateChange$, component: StateInput } = textInput(stateOrProvince$);
const { change$: stateDDChange$, component: StateDropdown } = dropdown(Object.values(State), state$);
const { onChange$: cityChange$, component: CityInput } = textInput(city$);
const { onChange$: zipChange$, component: ZipInput } = textInput(zip$);
const { change$: emissionsRateChange$, component: EmissionsRateDropdown } = dropdown<EmissionsRateScenario>(
    Object.values(EmissionsRateScenario),
    emissionsRate$
);
const { change$: socialCostChange$, component: SocialCostDropdown } = dropdown<SocialCostOfGhgScenario>(
    Object.values(SocialCostOfGhgScenario),
    socialCostOfGhgScenario$
);

const projectCollection$ = currentProject$.pipe(map((id) => db.projects.where("id").equals(id)));

function setAnalysisType([analysisType, collection]: [AnalysisType, Collection<Project>]) {
    // If OMB_NON_ENERGY, set purpose to default value, otherwise just set analysis type and keep purpose undefined.
    if (analysisType === AnalysisType.OMB_NON_ENERGY)
        collection.modify({
            analysisType,
            purpose: Purpose.INVEST_REGULATION
        });
    else collection.modify({ analysisType, purpose: undefined });
}

function dollarMethodForward(value: boolean): DollarMethod {
    return value ? DollarMethod.CONSTANT : DollarMethod.CURRENT;
}

const { component: ReleaseYearDropdown, change$: releaseYearChange$ } = dropdown(releaseYears$, releaseYear$);

export default function GeneralInformation() {
    useDbUpdate(nameChange$.pipe(defaultValue("Untitled Project")), projectCollection$, "name");
    useDbUpdate(analystChange$.pipe(defaultValue(undefined)), projectCollection$, "analyst");
    useDbUpdate(descriptionChange$.pipe(defaultValue(undefined)), projectCollection$, "description");
    useSubscribe(analysisTypeChange$.pipe(withLatestFrom(projectCollection$)), setAnalysisType);
    useDbUpdate(purposeChange$, projectCollection$, "purpose");
    useDbUpdate(studyPeriodChange$, projectCollection$, "studyPeriod");
    useDbUpdate(constructionPeriodChange$, projectCollection$, "constructionPeriod");
    useDbUpdate(dollarMethodChange$.pipe(map(dollarMethodForward)), projectCollection$, "dollarMethod");
    useDbUpdate(inflationChange$.pipe(defaultValue(undefined)), projectCollection$, "inflationRate");
    useDbUpdate(nomDiscChange$.pipe(defaultValue(undefined)), projectCollection$, "nominalDiscountRate");
    useDbUpdate(realDiscChange$.pipe(defaultValue(undefined)), projectCollection$, "realDiscountRate");
    useDbUpdate(
        discountingMethodChange$.pipe(defaultValue(DiscountingMethod.END_OF_YEAR)),
        projectCollection$,
        "discountingMethod"
    );
    useDbUpdate(countryChange$.pipe(defaultValue(Country.USA)), projectCollection$, "location.country");
    useDbUpdate(zipChange$.pipe(defaultValue(undefined)), projectCollection$, "location.zipcode");
    useDbUpdate(stateDDChange$.pipe(defaultValue(undefined)), projectCollection$, "location.state");
    useDbUpdate(stateChange$.pipe(defaultValue(undefined)), projectCollection$, "location.stateOrProvince");
    useDbUpdate(cityChange$.pipe(defaultValue(undefined)), projectCollection$, "location.city");
    useDbUpdate(emissionsRateChange$.pipe(defaultValue(undefined)), projectCollection$, "ghg.emissionsRateScenario");
    useDbUpdate(socialCostChange$.pipe(defaultValue(undefined)), projectCollection$, "ghg.socialCostOfGhgScenario");
    useDbUpdate(releaseYearChange$, projectCollection$, "releaseYear");

    //TODO make ghg values removable
    //TODO make location reset when switching to US vs non-US

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <NameInput label={"Project Name"} type={TextInputType.PRIMARY} placeholder={"Untitled Project"} />
                <AnalystInput label={"Analyst"} type={TextInputType.PRIMARY} />

                <AnalysisTypeDropdown label={"Analysis Type"} className={"w-full"} />
                {useAnalysisType() === "OMB Analysis, Non-Energy Project" && (
                    <AnalysisPurposeDropdown label={"Analysis Purpose"} className={"w-full"} />
                )}

                <span className={"col-span-2"}>
                    <DescInput label={"Description"} className={"w-full"} />
                </span>
                <div className={"col-span-2 grid grid-cols-3 gap-x-16 gap-y-4"}>
                    <StudyPeriodInput
                        addonAfter={"years"}
                        defaultValue={0}
                        //max={40}
                        min={0}
                        controls={true}
                    />
                    <ConstructionPeriodInput addonAfter={"years"} defaultValue={0} max={40} min={0} controls={true} />

                    <ReleaseYearDropdown className={"w-full"} label={"Data Release Year"} />
                </div>
            </div>
            <div className={"pt-4"}>
                <Title level={5}>Dollar Analysis</Title>
                <DollarMethodSwitch
                    className={"bg-primary hover:bg-primary"}
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
                    <div className={"col-span-2"}>{<DiscountingConvention label={"Discounting Convention"} />}</div>
                    <div className={"col-span-2 grid grid-cols-3 gap-x-16 gap-y-4"}>
                        <GenInflationRate addonAfter={"%"} controls={false} />
                        <NominalDiscRate addonAfter={"%"} controls={false} min={0.0} />
                        <RealDiscRate addonAfter={"%"} controls={false} min={0.0} />
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
                    <CountryDropdown label={"Country"} className={"w-full"} value={useCountry()} />
                    <CityInput label={"City"} type={TextInputType.PRIMARY} />
                    {useCountry() === Country.USA ? (
                        <StateDropdown label={"State"} className={"w-full"} />
                    ) : (
                        <StateInput label={"State"} type={TextInputType.PRIMARY} />
                    )}
                    {useCountry() === Country.USA && <ZipInput label={"Zip"} type={TextInputType.PRIMARY} />}
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
                <EmissionsRateDropdown label={"Emissions Rate Scenario"} className={"w-full"} />
                <SocialCostDropdown label={"Social Cost of GHG Scenario"} className={"w-full"} />
            </div>
        </div>
    );
}
