import ResultAlternativeSelect from "../../components/ResultAlternativeSelect";
import Header from "../../components/Header";
import AlternativeNpvCashFlow from "../../components/grids/alternative-results/AlternativeNpvCashFlow";
import ShareOfEnergyUse from "../../components/graphs/alternative-results/ShareOfEnergyUse";
import ShareOfLcc from "../../components/graphs/alternative-results/ShareOfLcc";
import ResourceUsage from "../../components/grids/alternative-results/ResourceUsage";

export default function AlternativeResults() {
    return (
        <div className={"mb-28 flex w-full flex-col gap-8 p-5"}>
            <div className={"col-span-2"}>
                <ResultAlternativeSelect />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <Header>NPV Cash Flow Comparison</Header>
                    <AlternativeNpvCashFlow />
                </div>
                <div>
                    <Header>Energy and Water use, Emissions, and Social Cost of GHG</Header>
                    <ResourceUsage />
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
