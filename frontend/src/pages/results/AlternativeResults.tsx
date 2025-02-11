import Header from "components/Header";
import ResultAlternativeSelect from "components/ResultAlternativeSelect";
import ShareOfEnergyUse from "components/graphs/alternative-results/ShareOfEnergyUse";
import ShareOfLcc from "components/graphs/alternative-results/ShareOfLcc";
import AlternativeNpvCostTypeGrid from "components/grids/alternative-results/AlternativeNpvCostTypeGrid";
import ResourceUsageGrid from "components/grids/alternative-results/ResourceUsageGrid";

export default function AlternativeResults() {
    return (
        <div className={"mb-28 flex w-full flex-col gap-8 p-5 h-full overflow-y-auto pb-48"}>
            <div className={"col-span-2"}>
                <ResultAlternativeSelect />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <Header>NPV by Cost Type</Header>
                    <AlternativeNpvCostTypeGrid/>
                </div>
                <div>
                    <Header>Resource Use and Emissions</Header>
                    <ResourceUsageGrid />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <Header>Share of LCC</Header>
                    <ShareOfLcc />
                </div>
                <div>
                    <Header>Share of Energy Use</Header>
                    <ShareOfEnergyUse />
                </div>
            </div>
        </div>
    );
}
