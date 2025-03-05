import type { Measures } from "@lrd/e3-sdk";
import { createSignal } from "@react-rxjs/utils";
import { type Chart, bb } from "billboard.js";
import { FuelType } from "blcc-format/Format";
import { useSubscribe } from "hooks/UseSubscribe";
import { ResultModel } from "model/ResultModel";
import { useEffect } from "react";
import { combineLatest, iif, of } from "rxjs";
import { combineLatestWith, debounceTime, startWith } from "rxjs/operators";
import { guard } from "util/Operators";

export const GRAPH_ID = "share-of-energy-use-chart";
export const OFFSCREEN_GRAPH_ID_TEMPLATE = `offscreen-${GRAPH_ID}`;
export const OFFSCREEN_GRAPH_CLASS = `offscreen-${GRAPH_ID}`;

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = combineLatest([ResultModel.selectedMeasure$, chart$]);

type ShareOfEnergyUseGraphProps = {
    measure?: Measures;
    offscreen?: boolean;
};
export default function ShareOfEnergyUse({ measure, offscreen = false }: ShareOfEnergyUseGraphProps) {
    const graphId = offscreen ? `${OFFSCREEN_GRAPH_ID_TEMPLATE}-${measure?.altId}` : GRAPH_ID;

    useSubscribe(
        iif(() => measure !== undefined, of(measure).pipe(guard(), combineLatestWith(chart$)), loadData$),
        ([measure, chart]) => {
            const categories = [
                FuelType.ELECTRICITY,
                FuelType.NATURAL_GAS,
                FuelType.DISTILLATE_OIL,
                FuelType.RESIDUAL_OIL,
                FuelType.PROPANE,
            ].map((fuelType) => [fuelType, measure.totalTagFlows[fuelType] ?? 0]);

            chart.unload({
                done: () => chart.load({ columns: categories }),
            });
        },
    );

    useEffect(() => {
        const chart = bb.generate({
            data: {
                columns: [],
                type: "pie",
            },
            bindto: `#${graphId}`,
        });

        setChart(chart);

        return () => chart.destroy();
    }, [graphId]);

    return <div id={graphId} className={`h-[23rem]${offscreen ? ` ${OFFSCREEN_GRAPH_CLASS}` : ""}`} />;
}
