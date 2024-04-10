import ResultAlternativeSelect from "../../components/ResultAlternativeSelect";
import Header from "../../components/Header";
import NpvCashFlowComparison from "../../components/grids/annual-results/NpvCashFlowComparison";
import NpvCashFlowGraph from "../../components/graphs/annual-results/NpvCashFlowGraph";
import AlternativeNpvCashFlowGrid from "../../components/grids/annual-results/AlternativeNpvCashFlowGrid";
import AlternativeNpvCashFlowGraph from "../../components/graphs/annual-results/AlternativeNpvCashFlowGraph";
import TagObjectByYearGraph from "../../components/graphs/annual-results/TagObjectByYearGraph";

export default function AnnualResults() {
    return (
        <div className={"mb-28 flex w-full flex-col gap-8 p-5"}>
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
            <div>
                <ResultAlternativeSelect />
            </div>
            <div>
                <Header>NPV Cash Flow by Alternative</Header>
                <AlternativeNpvCashFlowGrid />
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <Header>NPV Cash Flows</Header>
                    <AlternativeNpvCashFlowGraph />
                </div>
                <div>
                    <Header>Tag/Object by Year</Header>
                    <TagObjectByYearGraph />
                </div>
            </div>
        </div>
    );
}
