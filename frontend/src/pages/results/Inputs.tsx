import { Divider } from "antd";
import type { USLocation } from "blcc-format/Format";
import ResultsInput from "components/ResultsInput";
import { useProject } from "model/Model";

export default function Inputs() {
    const project = useProject();

    if (project === undefined) return <>No project</>; //TODO make this error better

    return (
        <div className={"mb-28 max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <ResultsInput label="Project Name" dataVal={project.name} />
                <ResultsInput label="Analyst" dataVal={project.analyst} />
                <ResultsInput label="Analysis Type" dataVal={project.analysisType} />
                <ResultsInput label="Purpose" dataVal={project.purpose} />
                <span className={"col-span-2"}>
                    <ResultsInput label="Description" dataVal={project.description} />
                </span>
                <ResultsInput label="Study Period" dataVal={project.studyPeriod} />
                <ResultsInput label="Construction Period" dataVal={project.constructionPeriod} />
                <ResultsInput label="Dollar Method" dataVal={project.dollarMethod} />
            </div>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
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
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
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

            <div className="grid grid-cols-2">
                <Divider
                    className="col-span-2 pb-3"
                    style={{ fontSize: "20px" }}
                    orientation="left"
                    orientationMargin="0"
                >
                    Greenhouse Gas (GHG) Emissions and Cost Assumptions
                </Divider>
                <ResultsInput label="Data Source" dataVal={project.ghg.dataSource} />
                <ResultsInput label={"Emissions Rate Type"} dataVal={project.ghg.emissionsRateType} />
                <ResultsInput label="Social Cost of GHG Scenario" dataVal={project.ghg.socialCostOfGhgScenario} />
            </div>
        </div>
    );
}
