import type { Measures } from "@lrd/e3-sdk";
import { bb, type Chart } from "billboard.js";
import { FuelType } from "blcc-format/Format";
import { useLayoutEffect, useState } from "react";

export const GRAPH_ID = "share-of-energy-use-chart";
export const OFFSCREEN_GRAPH_ID_TEMPLATE = `offscreen-${GRAPH_ID}`;
export const OFFSCREEN_GRAPH_CLASS = `offscreen-${GRAPH_ID}`;

type ShareOfEnergyUseGraphProps = {
    measure: Measures;
    offscreen?: boolean;
};

export default function ShareOfEnergyUse({ measure, offscreen = false }: ShareOfEnergyUseGraphProps) {
    const graphId = offscreen ? `${OFFSCREEN_GRAPH_ID_TEMPLATE}-${measure?.altId}` : GRAPH_ID;

    const [chart, setChart] = useState<Chart>();

    useLayoutEffect(() => {
        if (!chart) return;

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
    }, [chart, measure]);

    useLayoutEffect(() => {
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
