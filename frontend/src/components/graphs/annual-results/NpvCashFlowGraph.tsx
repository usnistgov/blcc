import { createSignal } from "@react-rxjs/utils";
import { type Chart, bb } from "billboard.js";
import { useSubscribe } from "hooks/UseSubscribe";
import { ResultModel } from "model/ResultModel";
import { useEffect } from "react";
import { combineLatestWith } from "rxjs/operators";
import { dollarFormatter } from "util/Util";

const GRAPH_ID = "npv-cash-flow-chart";
export const OFFSCREEN_GRAPH_ID = `offscreen-${GRAPH_ID}`;

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = ResultModel.required$.pipe(combineLatestWith(ResultModel.alternativeNames$, chart$));

type NpvCashflowGraphProps = {
    offscreen?: boolean;
};
export default function NpvCashFlowGraph({ offscreen = false }: NpvCashflowGraphProps) {
    const graphId = offscreen ? OFFSCREEN_GRAPH_ID : GRAPH_ID;

    useSubscribe(loadData$, ([required, names, chart]) => {
        const values = required.map((x) => {
            return [names.get(x.altId) ?? "", ...x.totalCostsDiscounted];
        });

        chart.load({ columns: values });
    });

    useEffect(() => {
        const chart = bb.generate({
            data: {
                columns: [],
                type: "bar",
            },
            bindto: `#${graphId}`,
            axis: {
                y: {
                    tick: {
                        format: dollarFormatter.format,
                    },
                },
                x: {
                    label: {
                        text: "Year",
                        position: "outer-center",
                    },
                },
            },
            tooltip: {
                format: {
                    title: (x) => `Year ${x}`,
                    value: dollarFormatter.format,
                },
            },
        });

        setChart(chart);

        return () => chart.destroy();
    }, [graphId]);

    return <div id={graphId} className={"h-[23rem] result-graph"} />;
}
