import type { Measures } from "@lrd/e3-sdk";
import { bb, type Chart } from "billboard.js";
import { FuelType } from "blcc-format/Format";
import { Strings } from "constants/Strings";
import { useLayoutEffect, useState } from "react";
import { getGJByFuelType } from "util/ResultCalculations";

export const GRAPH_ID = "share-of-energy-use-chart";
export const OFFSCREEN_GRAPH_ID_TEMPLATE = `offscreen-${GRAPH_ID}`;
export const OFFSCREEN_GRAPH_CLASS = `offscreen-${GRAPH_ID}`;

type ShareOfEnergyUseGraphProps = {
    measure: Measures;
    offscreen?: boolean;
};

export default function ShareOfEnergyUse({ measure, offscreen = false }: ShareOfEnergyUseGraphProps) {
    const graphId = offscreen ? `${OFFSCREEN_GRAPH_ID_TEMPLATE}-${measure?.altId}` : GRAPH_ID;
    const usageExists = measure.quantitySum.Energy !== undefined && measure.quantitySum.Energy > 0;

    const [chart, setChart] = useState<Chart>();

    useLayoutEffect(() => {
        if (!chart) return;
        if (!usageExists) return;

        const categories = [
            FuelType.ELECTRICITY,
            FuelType.NATURAL_GAS,
            FuelType.DISTILLATE_OIL,
            FuelType.RESIDUAL_OIL,
            FuelType.PROPANE,
            FuelType.COAL,
        ].map((fuelType) => [fuelType, getGJByFuelType(measure, fuelType) ?? 0]);

        chart.unload({
            done: () => chart.load({ columns: categories }),
        });
    }, [chart, measure, usageExists]);

    useLayoutEffect(() => {
        if (!usageExists) return;
        const chart = bb.generate({
            data: {
                columns: [],
                type: "pie",
            },
            bindto: `#${graphId}`,
        });

        setChart(chart);

        return () => chart.destroy();
    }, [graphId, usageExists]);

    return (
        <>
            {(usageExists && (
                <div id={graphId} className={`h-[23rem]${offscreen ? ` ${OFFSCREEN_GRAPH_CLASS}` : ""}`} />
            )) || <p className={OFFSCREEN_GRAPH_CLASS}>{Strings.NO_ENERGY_DATA_AVAILABLE}</p>}
        </>
    );
}
