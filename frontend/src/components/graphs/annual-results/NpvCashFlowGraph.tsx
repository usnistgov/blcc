import { createSignal } from "@react-rxjs/utils";
import { type Chart, bb } from "billboard.js";
import { useSubscribe } from "hooks/UseSubscribe";
import { alternativeNames$, required$ } from "model/ResultModel";
import { useEffect } from "react";
import { combineLatestWith } from "rxjs/operators";
import { dollarFormatter } from "util/Util";

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = required$.pipe(combineLatestWith(alternativeNames$, chart$));

const GRAPH_ID = "npv-cash-flow-chart";

export default function NpvCashFlowGraph() {
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
            bindto: `#${GRAPH_ID}`,
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
    }, []);

    return <div id={GRAPH_ID} className={"h-[23rem]"} />;
}
