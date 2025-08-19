import Header from "components/Header";
import { NistFooter } from "components/NistHeaderFooter";
import ResultAlternativeSelect from "components/ResultAlternativeSelect";
import ShareOfEnergyUse from "components/graphs/alternative-results/ShareOfEnergyUse";
import ShareOfLcc from "components/graphs/alternative-results/ShareOfLcc";
import AlternativeNpvCostTypeGrid from "components/grids/alternative-results/AlternativeNpvCostTypeGrid";
import ResourceUsageGrid from "components/grids/alternative-results/ResourceUsageGrid";
import { ResultModel } from "model/ResultModel";

export default function AlternativeResults() {
    const measure = ResultModel.useSelectedMeasure();

    return (
        <div className={"mb-28 flex h-full w-full flex-col gap-8 overflow-y-auto p-5"}>
            <div className={"col-span-2"}>
                <ResultAlternativeSelect />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <Header>NPV by Cost Type</Header>
                    <AlternativeNpvCostTypeGrid />
                </div>
                <div>
                    <Header>Resource Use and Emissions</Header>
                    <ResourceUsageGrid />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <Header>Share of LCC</Header>
                    <ShareOfLcc measure={measure} />
                </div>
                <div>
                    <Header>Share of Energy Use</Header>
                    <ShareOfEnergyUse measure={measure} />
                </div>
            </div>

            <div className="mt-28">
                <NistFooter rounded={false} extraWhiteBackground={true} />
            </div>
        </div>
    );
}
