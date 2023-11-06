import { Divider, Typography } from "antd";

import textInput, { TextInputType } from "../../components/TextInput";
import textArea from "../../components/TextArea";
import dropdown from "../../components/Dropdown";
import inputNumber from "../../components/InputNumber";
import switchComp from "../../components/Switch";

import { Country, State } from "../../constants/LOCATION";
import {
    AnalysisType,
    Purpose,
    DiscountingMethod,
    EmissionsRateScenario,
    SocialCostOfGhgScenario,
    DollarMethod
} from "../../blcc-format/Format";
import { of, merge, combineLatest, iif } from "rxjs";
import { map, startWith, switchMap } from "rxjs/operators";
import { Model } from "../../model/Model";

const { Title } = Typography;

/*
 * rxjs components
 */

const { onChange$: nameChange$, component: NameInput } = textInput(Model.name$, of("Untitled Project"));
const { onChange$: analystChange$, component: AnalystInput } = textInput(Model.analyst$);
const { onChange$: descriptionChange$, component: DescInput } = textArea();
const { change$: analysisTypeChange$, component: AnalysisTypeDropdown } = dropdown(
    Object.values(AnalysisType),
    Model.analysisType$
);
const { change$: analysisPurposeChange$, component: AnalysisPurposeDropdown } = dropdown<Purpose>(
    Object.values(Purpose),
    Model.purpose$
);
const { onChange$: studyPeriodChange$, component: StudyPeriodInput } = inputNumber(Model.studyPeriod$);
const { onChange$: constructionPeriodChange$, component: ConstructionPeriodInput } = inputNumber(
    Model.constructionPeriod$
);
const { onChange$: dollarMethodChange$, component: Switch } = switchComp();
const { onChange$: inflationChange$, component: GenInflationRate } = inputNumber(Model.inflationRate$);
const { onChange$: nomDiscChange$, component: NominalDiscRate } = inputNumber(Model.nominalDiscountRate$);
const { onChange$: realDiscChange$, component: RealDiscRate } = inputNumber(Model.realDiscountRate$);
const { change$: discountingMethodChange$, component: DiscountingConvention } = dropdown<DiscountingMethod>(
    Object.values(DiscountingMethod),
    Model.discountingMethod$
);

const { change$: countryChange$, component: CountryDropdown } = dropdown<Country>(
    Object.values(Country),
    Model.country$
);
const { onChange$: stateChange$, component: StateInput } = textInput(Model.state$);
const { change$: stateDDChange$, component: StateDropdown } = dropdown<State>(Object.values(State), Model.state$);
const { onChange$: cityChange$, component: CityInput } = textInput(Model.city$);
const { onChange$: zipChange$, component: ZipInput } = textInput(Model.zip$);

const { change$: emissionsRateChange$, component: EmissionsRateDropdown } = dropdown<EmissionsRateScenario>(
    Object.values(EmissionsRateScenario),
    Model.emissionsRate$
);
const { change$: socialCostChange$, component: SocialCostDropdown } = dropdown<SocialCostOfGhgScenario>(
    Object.values(SocialCostOfGhgScenario),
    Model.socialCostOfGhgScenario$
);

const combinedLocation$ = countryChange$.pipe(
    startWith("United States of America"),
    switchMap((country) =>
        iif(
            () => country === "United States of America",
            combineLatest([
                countryChange$.pipe(startWith(country)),
                merge(stateDDChange$.pipe(startWith(undefined)), countryChange$.pipe(map(() => undefined))),
                merge(cityChange$.pipe(startWith(undefined)), countryChange$.pipe(map(() => undefined))),
                merge(zipChange$.pipe(startWith(undefined)), countryChange$.pipe(map(() => undefined)))
            ]).pipe(
                map(([country, state, city, zipcode]) => ({
                    country,
                    city,
                    state,
                    zipcode
                }))
            ),
            combineLatest([
                countryChange$.pipe(startWith(country)),
                merge(stateChange$.pipe(startWith(undefined)), countryChange$.pipe(map(() => undefined))),
                merge(cityChange$.pipe(startWith(undefined)), countryChange$.pipe(map(() => undefined)))
            ]).pipe(
                map(([country, state, city]) => ({
                    country,
                    city,
                    stateProvince: state
                }))
            )
        )
    )
);

const combinedGHG$ = combineLatest([
    emissionsRateChange$.pipe(startWith(undefined)),
    socialCostChange$.pipe(startWith(undefined))
]).pipe(
    map(([emissionsRateScenario, socialCostOfGhgScenario]) => {
        return {
            emissionsRateScenario,
            socialCostOfGhgScenario
        };
    })
);

const modifiedDollarMethod$ = dollarMethodChange$.pipe(
    map((val) => {
        return val ? DollarMethod.CONSTANT : DollarMethod.CURRENT;
    })
);

export {
    nameChange$,
    descriptionChange$,
    analystChange$,
    analysisTypeChange$,
    analysisPurposeChange$,
    dollarMethodChange$,
    modifiedDollarMethod$,
    inflationChange$,
    nomDiscChange$,
    realDiscChange$,
    countryChange$,
    cityChange$,
    stateChange$,
    stateDDChange$,
    studyPeriodChange$,
    constructionPeriodChange$,
    discountingMethodChange$,
    zipChange$,
    emissionsRateChange$,
    socialCostChange$,
    combinedLocation$,
    combinedGHG$
};

export default function GeneralInformation() {
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
                {Model.useAnalysisType() === "OMB Analysis, Non-Energy Project" ? (
                    <span className="pb-3">
                        <Title level={5}>Analysis Purpose</Title>
                        <AnalysisPurposeDropdown className="w-3/4" />
                    </span>
                ) : (
                    ""
                )}
                <span className="col-span-2 pb-3">
                    <Title level={5}>Description</Title>
                    <DescInput className="w-full" />
                </span>
                <span className="pb-3">
                    <Title level={5}>Length of Study Period</Title>
                    <StudyPeriodInput after="years" defaultValue={0} max={40} min={0} controls={true} />
                </span>
                <span className="pb-3 pl-3">
                    <Title level={5}>Construction Period</Title>
                    <ConstructionPeriodInput after="years" defaultValue={0} max={40} min={0} controls={true} />
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
                        <DiscountingConvention className="w-3/4" />
                    </span>
                    <span className="pb-3">
                        <Title level={5}>General Inflation Rate</Title>
                        <GenInflationRate className="w-3/4" controls={false} />
                    </span>
                    <span className="pb-3 w-full">
                        <Title level={5}>Nominal Discount Rate</Title>
                        <NominalDiscRate className="w-3/4" controls={false} min={0.0} />
                    </span>
                    <span>
                        <Title level={5}>Real Discount Rate</Title>
                        <RealDiscRate className="w-3/4" controls={false} min={0.0} />
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
                        <CountryDropdown className="w-3/4" value={Model.useCountry()} />
                    </span>
                    <span>
                        <Title level={5}>City</Title>
                        <CityInput className="w-3/4" type={TextInputType.PRIMARY} />
                    </span>
                    <span className="pb-3">
                        <Title level={5}>State</Title>
                        {Model.useCountry() === "United States of America" ? (
                            <StateDropdown className="w-3/4" />
                        ) : (
                            <StateInput className="w-3/4" type={TextInputType.PRIMARY} />
                        )}
                    </span>
                    {Model.useCountry() === "United States of America" ? (
                        <span>
                            <Title level={5}>Zip</Title>
                            <ZipInput className="w-3/4" type={TextInputType.PRIMARY} />
                        </span>
                    ) : (
                        ""
                    )}
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
                    <EmissionsRateDropdown className="w-1/2" />
                </span>
                <span className="pb-3">
                    <Title level={5}>Social Cost of GHG Scenario </Title>
                    <SocialCostDropdown className="w-1/2" />
                </span>
            </div>
        </div>
    );
}
