import Header from "components/Header";
import LifeCycleResourceComparison from "components/grids/summary/LifeCycleResourceComparison";
import LifecycleResultsComparison from "components/grids/summary/LifeCycleResultsComparison";
import LifecycleResultsToBaseline from "components/grids/summary/LifeCycleResultsToBaseline";
import NpvCostsBySubcategory from "components/grids/summary/NpvCostsBySubcategory";

export default function Summary() {
    return (
        <div className={"mb-28 flex w-full flex-col gap-8 p-5"}>
            <div>
                <Header>Life Cycle Results Comparison</Header>
                <LifecycleResultsComparison />
            </div>
            <div>
                <Header>Life Cycle Results Relative to Baseline Alternative</Header>
                <LifecycleResultsToBaseline />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <Header>NPV Costs by Cost Subcategory</Header>
                    <NpvCostsBySubcategory />
                </div>
                <div>
                    <Header>Life Cycle Resource Consumption and Emissions Comparison</Header>
                    <LifeCycleResourceComparison />
                </div>
            </div>
        </div>
    );
}
