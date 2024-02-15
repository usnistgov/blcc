import { useSubscribe } from "../../hooks/UseSubscribe";
import { useEffect } from "react";
import { bb, Chart } from "billboard.js";
import { dollarFormatter } from "../../util/Util";
import { createSignal } from "@react-rxjs/utils";
import { selectedAlternative$, selectedRequired$ } from "../../model/ResultModel";
import { combineLatestWith } from "rxjs/operators";

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = selectedAlternative$.pipe(combineLatestWith(selectedRequired$, chart$));

const GRAPH_ID = "alternative-npv-cash-flow-chart";

export default function AlternativeNpvCashFlowGraph() {
    useSubscribe(loadData$, ([alternative, required, chart]) => {
        chart.load({ columns: [[alternative?.name ?? "", ...required.totalCostsDiscounted]] });
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
            bar: {
                padding: 0
            },
            legend: {
                show: false
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
