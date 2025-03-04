import Header from "components/Header";
import HeaderWithSelect from "components/HeaderWithSelect";
import ResultAlternativeSelect from "components/ResultAlternativeSelect";
import { ResultsSwitch } from "components/ResultsSwitch";
import AlternativeCashFlowGraph from "components/graphs/annual-results/AlternativeCashFlowGraph";
import NpvCashFlowGraph from "components/graphs/annual-results/NpvCashFlowGraph";
import TagObjectByYearGraph from "components/graphs/annual-results/TagObjectByYearGraph";
import AnnualCostTypeCashFlowGrid from "components/grids/annual-results/AnnualCostTypeCashFlowGrid";
import NpvCashFlowComparison from "components/grids/annual-results/NpvCashFlowComparison";
import { ResultModel } from "model/ResultModel";

export default function AnnualResults() {
    return (
        <div className={"mb-28 flex h-full w-full flex-col gap-8 overflow-y-auto p-5 pb-48"}>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <Header>NPV Cash Flow Comparison</Header>
                    <NpvCashFlowComparison />
                </div>
                <div>
                    <Header>NPV Cash Flows</Header>
                    <NpvCashFlowGraph />
                </div>
            </div>
            <div className="-mb-7 -mt-3 flex flex-row">
                <Header level={3}>Cash Flows by Alternative</Header>
            </div>
            <div className="flex flex-row gap-4">
                <ResultAlternativeSelect />
                <ResultsSwitch />
            </div>
            <div>
                <Header>By Cost Type</Header>
                <AnnualCostTypeCashFlowGrid />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <Header>By Subtype</Header>
                    <AlternativeCashFlowGraph />
                </div>
                <div>
                    <HeaderWithSelect
                        onChange={ResultModel.setCategorySelection}
                        options={ResultModel.useCategoryOptions}
                        value={ResultModel.useCategorySelection}
                    >
                        For Selected Cost Type
                    </HeaderWithSelect>
                    <TagObjectByYearGraph />
                </div>
            </div>
        </div>
    );
}
