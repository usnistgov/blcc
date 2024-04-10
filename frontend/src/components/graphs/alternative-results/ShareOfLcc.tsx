import { createSignal } from "@react-rxjs/utils";
import { bb, type Chart } from "billboard.js";
import { combineLatest } from "rxjs";
import { selectedMeasure$ } from "../../../model/ResultModel";
import { debounceTime } from "rxjs/operators";
import { useEffect } from "react";
import { useSubscribe } from "../../../hooks/UseSubscribe";

const GRAPH_ID = "share-of-lcc-chart";

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = combineLatest([selectedMeasure$, chart$]).pipe(debounceTime(1));

export default function ShareOfLcc() {
    useSubscribe(loadData$, ([measure, chart]) => {
        chart.unload({
            done: () =>
                chart.load({
                    columns: [
                        ["Investment", measure.totalTagFlows["Initial Investment"] ?? 0],
                        ["Energy", measure.totalTagFlows.Energy ?? 0],
                        ["Water", measure.totalTagFlows.Water ?? 0],
                        ["OMR", measure.totalTagFlows.OMR ?? 0],
                        ["Replacement", measure.totalTagFlows.Replacement ?? 0],
                        ["Residual Value", measure.totalTagFlows["Residual Value"] ?? 0]
                    ]
                })
        });
    });

    useEffect(() => {
        const chart = bb.generate({
            data: {
                columns: [],
                type: "pie"
            },
            bindto: `#${GRAPH_ID}`
        });

        setChart(chart);

        return () => chart.destroy();
    }, []);

    return <div id={GRAPH_ID} className={"h-[23rem]"} />;
}
