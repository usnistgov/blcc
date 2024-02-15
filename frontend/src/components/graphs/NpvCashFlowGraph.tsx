import { useSubscribe } from "../../hooks/UseSubscribe";
import { useEffect } from "react";
import { bb, Chart } from "billboard.js";
import { dollarFormatter } from "../../util/Util";
import { createSignal } from "@react-rxjs/utils";
import { alternativeNames$, required$ } from "../../model/ResultModel";
import { combineLatestWith } from "rxjs/operators";

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
                type: "bar"
            },
            bindto: `#${GRAPH_ID}`,
            axis: {
                y: {
                    tick: {
                        format: dollarFormatter.format
                    }
                },
                x: {
                    label: {
                        text: "Year",
                        position: "outer-center"
                    }
                }
            },
            tooltip: {
                format: {
                    title: (x) => `Year ${x}`,
                    value: dollarFormatter.format
                }
            }
        });

        setChart(chart);

        return () => chart.destroy();
    }, []);

    return <div id={GRAPH_ID} className={"h-full w-full"} />;
}
