import { Divider } from "antd";
import { Defaults } from "blcc-format/Defaults";
import type { Project, USLocation } from "blcc-format/Format";
import ResultsInput from "components/ResultsInput";
import { Effect } from "effect";
import { DexieService } from "model/db";
import { useLayoutEffect, useState } from "react";
import { percentFormatter } from "util/Util";
import { BlccRuntime } from "util/runtime";

export default function Inputs() {
    const [project, setProject] = useState<Project>();
    useLayoutEffect(() => {
        BlccRuntime.runPromise(
            Effect.gen(function* () {
                const db = yield* DexieService;
                return yield* db.getProject(Defaults.PROJECT_ID).pipe(
                    Effect.tap((project) => {
                        if (project !== undefined) setProject(project);
                    }),
                );
            }),
        );
    }, []);

    return (
        <div className={"mb-28 h-full w-full overflow-y-auto p-6 pb-48"}>
            {project && (
                <div className={"max-w-screen-md"}>
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
                        <ResultsInput
                            label="General Inflation Rate"
                            dataVal={percentFormatter.format(project.inflationRate ?? 0)}
                        />
                        <ResultsInput
                            label="Nominal Discount Rate"
                            dataVal={percentFormatter.format(project.nominalDiscountRate ?? 0)}
                        />
                        <ResultsInput
                            label="Real Discount Rate"
                            dataVal={percentFormatter.format(project.realDiscountRate ?? 0)}
                        />
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
                            Greenhouse Gas (GHG) Emissions Assumptions
                        </Divider>
                        <ResultsInput label="Data Source" dataVal={project.ghg.dataSource} />
                        <ResultsInput label={"Emissions Rate Type"} dataVal={project.ghg.emissionsRateType} />
                    </div>
                </div>
            )}
        </div>
    );
}
