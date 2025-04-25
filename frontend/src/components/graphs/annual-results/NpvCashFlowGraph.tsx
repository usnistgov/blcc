import { type Chart, bb } from "billboard.js";
import { useEffect, useLayoutEffect, useState } from "react";
import { dollarFormatter } from "util/Util";
import type { Required } from "@lrd/e3-sdk";
import { Strings } from "constants/Strings";

const GRAPH_ID = "npv-cash-flow-chart";
export const OFFSCREEN_GRAPH_ID = `offscreen-${GRAPH_ID}`;

type NpvCashflowGraphProps = {
    required: Required[];
    alternativeNames: Map<number, string>;
    discountedCashFlow?: boolean;
    offscreen?: boolean;
};
export default function NpvCashFlowGraph({
    required,
    alternativeNames,
    discountedCashFlow = true,
    offscreen = false,
}: NpvCashflowGraphProps) {
    const graphId = offscreen ? OFFSCREEN_GRAPH_ID : GRAPH_ID;

    const [chart, setChart] = useState<Chart>();
    const [graphIsNotEmpty, setGraphIsNotEmpty] = useState<boolean>(true);

    useLayoutEffect(() => {
        if (!chart) return;

        const values = required.map((x) => {
            return discountedCashFlow
                ? [alternativeNames.get(x.altId) ?? "", ...x.totalCostsDiscounted]
                : [alternativeNames.get(x.altId) ?? "", ...x.totalCostsNonDiscounted];
        });

        setGraphIsNotEmpty(
            values.map((column) => column.slice(1).some((val) => val !== 0)).some((hasNonZero) => hasNonZero),
        );

        if (!graphIsNotEmpty) return;

        chart.unload({
            done: () => chart.load({ columns: values }),
        });
    });

    useLayoutEffect(() => {
        if (!graphIsNotEmpty) return;
        const chart = bb.generate({
            data: {
                columns: [],
                type: "bar",
            },
            bindto: `#${graphId}`,
            axis: {
                y: {
                    tick: {
                        format: dollarFormatter.format,
                    },
                },
                x: {
                    label: {
                        text: "Year",
                        position: "outer-center",
                    },
                },
            },
            tooltip: {
                format: {
                    title: (x) => `Year ${x}`,
                    value: dollarFormatter.format,
                },
            },
        });

        setChart(chart);

        return () => chart.destroy();
    }, [graphId, graphIsNotEmpty]);

    return (
        <>
            {(graphIsNotEmpty && <div id={graphId} className={"result-graph h-[23rem]"} />) || (
                <p id={graphId}>{Strings.NO_FINANCIAL_DATA_AVAILABLE}</p>
            )}
        </>
    );
}
