import type { Measures } from "@lrd/e3-sdk";
import { type Chart, bb } from "billboard.js";
import { Strings } from "constants/Strings";
import { useLayoutEffect, useState } from "react";

export const GRAPH_ID = "share-of-lcc-chart";
export const OFFSCREEN_GRAPH_ID_TEMPLATE = `offscreen-${GRAPH_ID}`;
export const OFFSCREEN_GRAPH_CLASS = `offscreen-${GRAPH_ID}`;

type ShareOfLccGraphProps = {
    measure: Measures;
    offscreen?: boolean;
};
export default function ShareOfLcc({ measure, offscreen = false }: ShareOfLccGraphProps) {
    const graphId = offscreen ? `${OFFSCREEN_GRAPH_ID_TEMPLATE}-${measure?.altId}` : GRAPH_ID;

    const [chart, setChart] = useState<Chart>();
    const costsExist = measure.totalCosts !== undefined && measure.totalCosts > 0;

    useLayoutEffect(() => {
        if (!chart) return;
        if (!costsExist) return;

        chart.unload({
            done: () =>
                chart.load({
                    columns: [
                        ["Investment", measure.totalTagFlows["Initial Investment"] ?? 0],
                        ["Energy", measure.totalTagFlows.Energy ?? 0],
                        ["Water", measure.totalTagFlows.Water ?? 0],
                        ["OMR", measure.totalTagFlows.OMR ?? 0],
                        ["Replacement", measure.totalTagFlows.Replacement ?? 0],
                        ["Residual Value", measure.totalTagFlows["Residual Value"] ?? 0],
                    ],
                }),
        });
    }, [chart, measure, costsExist]);

    useLayoutEffect(() => {
        if (!costsExist) return;
        const chart = bb.generate({
            data: {
                columns: [],
                type: "pie",
            },
            bindto: `#${graphId}`,
        });

        setChart(chart);

        return () => chart.destroy();
    }, [graphId, costsExist]);

    return (
        <>
            {(costsExist && (
                <div id={graphId} className={`h-[23rem]${offscreen ? ` ${OFFSCREEN_GRAPH_CLASS}` : ""}`} />
            )) || <p>{Strings.NO_FINANCIAL_DATA_AVAILABLE}</p>}
        </>
    );
}
