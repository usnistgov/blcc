import { createSignal } from "@react-rxjs/utils";
import { type Chart, bb } from "billboard.js";
import { useSubscribe } from "hooks/UseSubscribe";
import { ResultModel } from "model/ResultModel";
import { useEffect, useLayoutEffect, useState } from "react";
import { combineLatestWith } from "rxjs/operators";
import { dollarFormatter } from "util/Util";
import type { Required } from "@lrd/e3-sdk";

const GRAPH_ID = "npv-cash-flow-chart";
export const OFFSCREEN_GRAPH_ID = `offscreen-${GRAPH_ID}`;

type NpvCashflowGraphProps = {
    required: Required[];
    alternativeNames: Map<number, string>;
    offscreen?: boolean;
};
export default function NpvCashFlowGraph({ required, alternativeNames, offscreen = false }: NpvCashflowGraphProps) {
    const graphId = offscreen ? OFFSCREEN_GRAPH_ID : GRAPH_ID;

    const [chart, setChart] = useState<Chart>();

    useLayoutEffect(() => {
        if (!chart) return;

        const values = required.map((x) => {
            return [alternativeNames.get(x.altId) ?? "", ...x.totalCostsDiscounted];
        });

        chart.unload({
            done: () => chart.load({ columns: values }),
        });
    });

    useLayoutEffect(() => {
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
