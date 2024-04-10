import { useSubscribe } from "../../../hooks/UseSubscribe";
import { useEffect } from "react";
import { bb, type Chart } from "billboard.js";
import { dollarFormatter } from "../../../util/Util";
import { createSignal } from "@react-rxjs/utils";
import { required$, selection$ } from "../../../model/ResultModel";
import { debounceTime } from "rxjs/operators";
import { alternatives$ } from "../../../model/Model";
import { combineLatest } from "rxjs";

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = combineLatest([selection$, chart$, alternatives$, required$]).pipe(debounceTime(1));

const GRAPH_ID = "alternative-npv-cash-flow-chart";

export default function AlternativeNpvCashFlowGraph() {
    useSubscribe(loadData$, ([selection, chart, alternatives, allRequired]) => {
        const alternative = alternatives.find((alt) => alt.id === selection);
        const required = allRequired.find((req) => req.altId === selection);

        chart.unload({
            done: () => chart.load({ columns: [[alternative?.name ?? "", ...(required?.totalCostsDiscounted ?? [])]] })
        });
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

    return <div id={GRAPH_ID} className={"h-[23rem] w-full"} />;
}
