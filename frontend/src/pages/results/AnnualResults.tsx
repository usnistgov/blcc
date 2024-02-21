import { Select, Typography } from "antd";
import NpvCashFlowComparison from "../../components/grids/NpvCashFlowComparison";
import { selectAlternative, useOptions, useSelection } from "../../model/ResultModel";
import NpvCashFlowGraph from "../../components/graphs/NpvCashFlowGraph";
import React from "react";
import AlternativeNpvCashFlowGraph from "../../components/graphs/AlternativeNpvCashFlowGraph";
import AlternativeNpvCashFlowGrid from "../../components/grids/AlternativeNpvCashFlowGrid";
import ResultAlternativeSelect from "../../components/ResultAlternativeSelect";

const { Title } = Typography;

export default function AnnualResults() {
    return (
        <div className={"mb-28 w-full p-5"}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className={"mb-4 flex justify-between border-b-2 border-base-lightest"}>
                        <Title level={5}>NPV Cash Flow Comparison</Title>
                    </div>
                    <NpvCashFlowComparison />
                </div>
                <div>
                    <div className={"mb-4 flex justify-between border-b-2 border-base-lightest"}>
                        <Title level={5}>NPV Cash Flows</Title>
                    </div>
                    <NpvCashFlowGraph />
                </div>
            </div>
            <br />
            <div>
                <ResultAlternativeSelect />
            </div>
            <br />
            <div>
                <div className={"mb-4 flex justify-between border-b-2 border-base-lightest"}>
                    <Title level={5}>NPV Cash Flow by Alternative</Title>
                </div>
                <AlternativeNpvCashFlowGrid />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className={"mb-4 flex justify-between border-b-2 border-base-lightest"}>
                        <Title level={5}>NPV Cash Flows</Title>
                    </div>
                    <AlternativeNpvCashFlowGraph />
                </div>
                <div>
                    <div className={"mb-4 flex justify-between border-b-2 border-base-lightest"}>
                        <Title level={5}>Tag/Object by Year</Title>
                    </div>
                </div>
            </div>
        </div>
    );
}
