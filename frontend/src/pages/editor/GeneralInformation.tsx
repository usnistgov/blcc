import { Divider } from "antd";

import dropdown from "../../components/Dropdown";
import inputNumber from "../../components/InputNumber";
import switchComp from "../../components/Switch";
import textArea from "../../components/TextArea";
import textInput, { TextInputType } from "../../components/TextInput";

import { Observable, combineLatest, iif, merge, of } from "rxjs";
import { map, startWith, switchMap } from "rxjs/operators";
import {
    AnalysisType,
    DiscountingMethod,
    DollarMethod,
    EmissionsRateScenario,
    Location,
    NonUSLocation,
    Purpose,
    SocialCostOfGhgScenario,
    USLocation
} from "../../blcc-format/Format";
import { Country, State } from "../../constants/LOCATION";
import { Model } from "../../model/Model";
import Title from "antd/es/typography/Title";

/*
 * rxjs components
 */

const { onChange$: nameChange$, component: NameInput } = textInput(Model.name$, of("Untitled Project"));
const { onChange$: analystChange$, component: AnalystInput } = textInput(Model.analyst$);
const { onChange$: descriptionChange$, component: DescInput } = textArea(Model.description$);
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
const { onChange$: dollarMethodChange$, component: Switch } = switchComp(
    Model.dollarMethod$.pipe(
        map((method) => {
            switch (method) {
                case DollarMethod.CURRENT:
                    return false;
                case DollarMethod.CONSTANT:
                default:
                    return true;
            }
        })
    )
);
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

const combinedLocation$: Observable<Location> = countryChange$.pipe(
    startWith(Country.USA),
    switchMap((country) =>
        iif(
            () => country === Country.USA,
            combineLatest([
                countryChange$.pipe(startWith(country)),
                merge(stateDDChange$.pipe(startWith(undefined)), countryChange$.pipe(map(() => undefined))),
                merge(cityChange$.pipe(startWith(undefined)), countryChange$.pipe(map(() => undefined))),
                merge(zipChange$.pipe(startWith(undefined)), countryChange$.pipe(map(() => undefined)))
            ]).pipe(
                map(
                    ([country, state, city, zipcode]) =>
                        ({
                            country,
                            city,
                            state,
                            zipcode
                        }) as USLocation
                )
            ),
            combineLatest([
                countryChange$.pipe(startWith(country)),
                merge(stateChange$.pipe(startWith(undefined)), countryChange$.pipe(map(() => undefined))),
                merge(cityChange$.pipe(startWith(undefined)), countryChange$.pipe(map(() => undefined)))
            ]).pipe(
                map(
                    ([country, state, city]) =>
                        ({
                            country,
                            city,
                            stateProvince: state
                        }) as NonUSLocation
                )
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

const modifiedDollarMethod$: Observable<DollarMethod> = dollarMethodChange$.pipe(
    map((val) => {
        return val ? DollarMethod.CONSTANT : DollarMethod.CURRENT;
    })
);

export {
    analysisPurposeChange$,
    analysisTypeChange$,
    analystChange$,
    combinedGHG$,
    combinedLocation$,
    constructionPeriodChange$,
    descriptionChange$,
    discountingMethodChange$,
    inflationChange$,
    modifiedDollarMethod$,
    nameChange$,
    nomDiscChange$,
    realDiscChange$,
    studyPeriodChange$
};

export default function GeneralInformation() {
    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <NameInput label={"Project Name"} type={TextInputType.PRIMARY} />
                <AnalystInput label={"Analyst"} type={TextInputType.PRIMARY} />
                <AnalysisTypeDropdown label={"Analysis Type"} className={"w-full"} />
                {Model.useAnalysisType() === "OMB Analysis, Non-Energy Project" && (
                    <AnalysisPurposeDropdown label={"Analysis Purpose"} className={"w-full"} />
                )}
                <span className={"col-span-2"}>
                    <DescInput label={"Description"} className={"w-full"} />
                </span>
                <StudyPeriodInput
                    label={"Length of Study Period"}
                    addonAfter={"years"}
                    defaultValue={0}
                    max={40}
                    min={0}
                    controls={true}
                />
                <ConstructionPeriodInput
                    label={"Construction Period"}
                    addonAfter={"years"}
                    defaultValue={0}
                    max={40}
                    min={0}
                    controls={true}
                />
            </div>
            <div className={"pt-4"}>
                <Title level={5}>Dollar Analysis</Title>
                <Switch
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
                    <div className={"col-span-2"}>
                        <DiscountingConvention label={"Discounting Convention"} />
                    </div>
                    <div className={"col-span-2 grid grid-cols-3 gap-x-16 gap-y-4"}>
                        <GenInflationRate addonAfter={"%"} label={"General Inflation Rate"} controls={false} />
                        <NominalDiscRate addonAfter={"%"} label={"Nominal Discount Rate"} controls={false} min={0.0} />
                        <RealDiscRate addonAfter={"%"} label={"Real Discount Rate"} controls={false} min={0.0} />
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
                    <CountryDropdown label={"Country"} className={"w-full"} value={Model.useCountry()} />
                    <CityInput label={"City"} type={TextInputType.PRIMARY} />
                    {Model.useCountry() === Country.USA ? (
                        <StateDropdown label={"State"} className={"w-full"} />
                    ) : (
                        <StateInput label={"State"} type={TextInputType.PRIMARY} />
                    )}
                    {Model.useCountry() === Country.USA && <ZipInput label={"Zip"} type={TextInputType.PRIMARY} />}
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
