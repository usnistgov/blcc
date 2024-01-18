import { Divider } from "antd";
import ResultsInput from "../../components/ResultsInput";
import { Model } from "../../model/Model";

import { useE3Result } from "../../components/ResultsAppBar";

export default function Inputs() {
    const e3Result = useE3Result();

    return (
        <div className={"h-full w-full p-8"}>
            <div className="grid w-1/2 grid-cols-2">
                <ResultsInput label="Project Name" dataVal={Model.useName()} />
                <ResultsInput label="Analyst" dataVal={Model.useAnalyst()} />
                <ResultsInput label="Analysis Type" dataVal={Model.useAnalysisType()} />
                <ResultsInput label="Purpose" dataVal={Model.usePurpose()} />
                <ResultsInput label="Description" dataVal={Model.useDescription()} />
                <ResultsInput label="Study Period" dataVal={Model.useStudyPeriod()} />
                <ResultsInput label="Construction Period" dataVal={Model.useConstructionPeriod()} />
                <ResultsInput label="Dollar Method" dataVal={Model.useDollarMethod()} />
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

                    <ResultsInput label="Discounting Convention" dataVal={Model.useDiscountingMethod()} />
                    <ResultsInput label="General Inflation Rate" dataVal={Model.useInflationRate()} />
                    <ResultsInput label="Nominal Discount Rate" dataVal={Model.useNominalDiscountRate()} />
                    <ResultsInput label="Real Discount Rate" dataVal={Model.useRealDiscountRate()} />
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
                    <ResultsInput label="Country" dataVal={Model.useCountry()} />
                    <ResultsInput label="City" dataVal={Model.useCity()} />
                    <ResultsInput label="State" dataVal={Model.useState()} />
                    <ResultsInput label="Zip" dataVal={Model.useZip()} />
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
                <ResultsInput label="Emissions Rate Scenario" dataVal={Model.useEmissionsRate()} />
                <ResultsInput label="Social Cost of GHG Scenario" dataVal={Model.useSocialCostRate()} />
            </div>
            <pre>{e3Result === undefined ? "No Results" : JSON.stringify(e3Result, undefined, 4)}</pre>
        </div>
    );
}
