import { useSubscribe } from "../../../hooks/UseSubscribe";
import { useEffect } from "react";
import { bb, Chart } from "billboard.js";
import { createSignal } from "@react-rxjs/utils";
import { combineLatest } from "rxjs";
import { selectedMeasure$ } from "../../../model/ResultModel";
import { debounceTime } from "rxjs/operators";
import { FuelType } from "../../../blcc-format/Format";

const GRAPH_ID = "share-of-energy-use-chart";

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = combineLatest([selectedMeasure$, chart$]).pipe(debounceTime(1));

export default function ShareOfEnergyUse() {
    useSubscribe(loadData$, ([measure, chart]) => {
        const categories = [
            FuelType.ELECTRICITY,
            FuelType.NATURAL_GAS,
            FuelType.DISTILLATE_OIL,
            FuelType.RESIDUAL_OIL,
            FuelType.PROPANE
        ].map((fuelType) => [fuelType, measure.totalTagFlows[fuelType] ?? 0]);

        chart.unload({
            done: () => chart.load({ columns: categories })
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
