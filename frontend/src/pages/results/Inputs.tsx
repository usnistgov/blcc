import { Divider } from "antd";
import ResultsInput from "../../components/ResultsInput";

import { useE3Result } from "../../components/ResultsAppBar";
import { useProject } from "../../model/Model";
import { USLocation } from "../../blcc-format/Format";

export default function Inputs() {
    const e3Result = useE3Result();
    const project = useProject();

    if (project === undefined) return <>No project</>; //TODO make this error better

    return (
        <div className={"h-full w-full p-8"}>
            <div className="grid w-1/2 grid-cols-2">
                <ResultsInput label="Project Name" dataVal={project.name} />
                <ResultsInput label="Analyst" dataVal={project.analyst} />
                <ResultsInput label="Analysis Type" dataVal={project.analysisType} />
                <ResultsInput label="Purpose" dataVal={project.purpose} />
                <ResultsInput label="Description" dataVal={project.description} />
                <ResultsInput label="Study Period" dataVal={project.studyPeriod} />
                <ResultsInput label="Construction Period" dataVal={project.constructionPeriod} />
                <ResultsInput label="Dollar Method" dataVal={project.dollarMethod} />
            </div>
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

                    <ResultsInput label="Discounting Convention" dataVal={project.discountingMethod} />
                    <ResultsInput label="General Inflation Rate" dataVal={project.inflationRate} />
                    <ResultsInput label="Nominal Discount Rate" dataVal={project.nominalDiscountRate} />
                    <ResultsInput label="Real Discount Rate" dataVal={project.realDiscountRate} />
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
                    <ResultsInput label="Country" dataVal={project.location.country} />
                    <ResultsInput label="City" dataVal={project.location.city} />
                    <ResultsInput label="State" dataVal={(project.location as USLocation).state ?? ""} />
                    <ResultsInput label="Zip" dataVal={(project.location as USLocation).zipcode ?? ""} />
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
                <ResultsInput label="Emissions Rate Scenario" dataVal={project.ghg.emissionsRateScenario} />
                <ResultsInput label="Social Cost of GHG Scenario" dataVal={project.ghg.socialCostOfGhgScenario} />
            </div>
            <pre>{e3Result === undefined ? "No Results" : JSON.stringify(e3Result, undefined, 4)}</pre>
        </div>
    );
}
