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
        <div className={"w-full h-full p-8 "}>
            <div className="w-1/2 grid grid-cols-2">
                <span className="pb-3">
                    <NameInput label="Project Name" className="w-3/4" type={TextInputType.PRIMARY} />
                </span>
                <span>
                    <AnalystInput label="Analyst" className="w-3/4" type={TextInputType.PRIMARY} />
                </span>
                <span className="pb-3">
                    <AnalysisTypeDropdown label="Analysis Type" className={"w-3/4"} />
                </span>
                {Model.useAnalysisType() === "OMB Analysis, Non-Energy Project" ? (
                    <span className="pb-3">
                        <AnalysisPurposeDropdown label="Analysis Purpose" className="w-3/4" />
                    </span>
                ) : (
                    ""
                )}
                <span className="col-span-2 pb-3">
                    <DescInput label="Description" className="w-full" />
                </span>
                <span className="pb-3">
                    <StudyPeriodInput
                        label="Length of Study Period"
                        after="years"
                        defaultValue={0}
                        max={40}
                        min={0}
                        controls={true}
                    />
                </span>
                <span className="pb-3 pl-3">
                    <ConstructionPeriodInput
                        label="Construction Period"
                        after="years"
                        defaultValue={0}
                        max={40}
                        min={0}
                        controls={true}
                    />
                </span>
            </div>
            <span className="w-1/4 pb-3">
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
                        <DiscountingConvention label="Discounting Convention" className="w-3/4" />
                    </span>
                    <span className="pb-3">
                        <GenInflationRate label="General Inflation Rate" className="w-3/4" controls={false} />
                    </span>
                    <span className="pb-3 w-full">
                        <NominalDiscRate label="Nominal Discount Rate" className="w-3/4" controls={false} min={0.0} />
                    </span>
                    <span>
                        <RealDiscRate label="Real Discount Rate" className="w-3/4" controls={false} min={0.0} />
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
                        <CountryDropdown label="Country" className="w-3/4" value={Model.useCountry()} />
                    </span>
                    <span>
                        <CityInput label="City" className="w-3/4" type={TextInputType.PRIMARY} />
                    </span>
                    <span className="pb-3">
                        {Model.useCountry() === Country.USA ? (
                            <StateDropdown label="State" className="w-3/4" />
                        ) : (
                            <StateInput label="State" className="w-3/4" type={TextInputType.PRIMARY} />
                        )}
                    </span>
                    {Model.useCountry() === Country.USA ? (
                        <span>
                            <ZipInput label="Zip" className="w-3/4" type={TextInputType.PRIMARY} />
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
                    <EmissionsRateDropdown label="Emissions Rate Scenario" className="w-1/2" />
                </span>
                <span className="pb-3">
                    <SocialCostDropdown label="Social Cost of GHG Scenario" className="w-1/2" />
                </span>
            </div>
        </div>
    );
}
