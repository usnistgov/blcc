import { createSignal } from "@react-rxjs/utils";
import { type Chart, bb } from "billboard.js";
import { FuelType } from "blcc-format/Format";
import { useSubscribe } from "hooks/UseSubscribe";
import { ResultModel } from "model/ResultModel";
import { useEffect } from "react";
import { combineLatest } from "rxjs";
import { debounceTime } from "rxjs/operators";

const GRAPH_ID = "share-of-energy-use-chart";

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = combineLatest([ResultModel.selectedMeasure$, chart$]).pipe(debounceTime(1));

export default function ShareOfEnergyUse() {
    useSubscribe(loadData$, ([measure, chart]) => {
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
    });

    useEffect(() => {
        const chart = bb.generate({
            data: {
                columns: [],
                type: "pie",
            },
            bindto: `#${GRAPH_ID}`,
        });

        setChart(chart);

        return () => chart.destroy();
    }, []);

    return <div id={GRAPH_ID} className={"h-[23rem]"} />;
}
