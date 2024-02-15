import { Divider, Select, Typography } from "antd";
import { map } from "rxjs/operators";
import NpvCashFlowComparison from "../../components/grids/NpvCashFlowComparison";
import { selectAlternative, selection$ } from "../../model/ResultModel";
import NpvCashFlowGraph from "../../components/graphs/NpvCashFlowGraph";
import { alternatives$ } from "../../model/Model";
import React from "react";
import { bind } from "@react-rxjs/core";
import AlternativeNpvCashFlowGraph from "../../components/graphs/AlternativeNpvCashFlowGraph";

const { Title } = Typography;

const [useOptions] = bind(
    alternatives$.pipe(
        map((alternatives) =>
            alternatives.map((alternative) => ({ value: alternative.id ?? 0, label: alternative.name }))
        )
    ),
    []
);
const [useSelection] = bind(selection$, 0);

export default function AnnualResults() {
    return (
        <div className={"h-full w-full p-5 "}>
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
                <Title level={5}>Annual Results for Alternative</Title>
                <Select
                    className={"w-1/4"}
                    onChange={selectAlternative}
                    options={useOptions()}
                    value={useSelection()}
                />
            </div>
            <br />
            <Title level={5}>NPV Cash Flow by Alternative</Title>
            <Divider />
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
