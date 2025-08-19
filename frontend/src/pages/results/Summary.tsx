import Header from "components/Header";
import LifeCycleResourceComparison from "components/grids/summary/LifeCycleResourceComparison";
import LifecycleResultsComparison from "components/grids/summary/LifeCycleResultsComparison";
import LifecycleResultsToBaseline from "components/grids/summary/LifeCycleResultsToBaseline";
import NpvCostsBySubcategory from "components/grids/summary/NpvCostsBySubcategory";
import { useHasNoBaseline } from "../../model/Model";
import { Alert } from "antd";
import { NistFooter } from "components/NistHeaderFooter";

export default function Summary() {
    const hasBaseline = useHasNoBaseline();

    return (
        <div className="flex h-full w-full flex-col overflow-y-auto pt-6 pb-48">
            {hasBaseline && (
                <div className="flex w-full flex-col items-center">
                    <Alert
                        message="Error: No Baseline"
                        description="Please set one alternative as a baseline for full results."
                        type="error"
                        closable
                        className="w-1/3"
                    />
                </div>
            )}
            <div className={"flex h-full w-full flex-col gap-8 p-5 pt-2"}>
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
                <div className="pt-10">
                    <NistFooter rounded={false} extraWhiteBackground={true} />
                </div>
            </div>
        </div>
    );
}
