import type { Optional } from "@lrd/e3-sdk";
import { type Chart, bb } from "billboard.js";
import { Strings } from "constants/Strings";
import { ResultModel } from "model/ResultModel";
import { useEffect, useLayoutEffect, useState } from "react";
import { dollarFormatter } from "util/Util";

/*  Type representing format of data columns: an array of arrays with a string identifier as the first item followed by numbers */
type AlternativeNpvCashFlowGraphColumns = [(string | number)[], (string | number)[]] | [(string | number)[]] | [];

const GRAPH_ID = "alternative-npv-cash-flow-chart";
export const OFFSCREEN_GRAPH_ID_TEMPLATE = `offscreen-${GRAPH_ID}`;
export const OFFSCREEN_GRAPH_CLASS = `offscreen-${GRAPH_ID}`;

function getColumn(altId: number, optionals: Map<string, Optional>, category: string, discountedCashFlow: boolean) {
    const key = `${altId} ${category}`;
    const tag = ResultModel.categoryToDisplayName.get(category) ?? "";
    const results = discountedCashFlow
        ? optionals.get(key)?.totalTagCashflowDiscounted
        : optionals.get(key)?.totalTagCashflowNonDiscounted;
    return [tag, ...(results ?? [])];
}

function getColumns(
    altId: number,
    optionals: Map<string, Optional>,
    discountedCashFlow: boolean,
): AlternativeNpvCashFlowGraphColumns {
    let columns: AlternativeNpvCashFlowGraphColumns = [];
    for (const category of ResultModel.categories) {
        columns = [getColumn(altId, optionals, category, discountedCashFlow), ...columns];
    }
    return columns;
}

type AlternativeCashFlowProps = {
    selection: number;
    optionals: Map<string, Optional>;
    discountedCashFlow: boolean;
    offscreen?: boolean;
};
export default function AlternativeCashFlowGraph({
    selection,
    optionals,
    discountedCashFlow = true,
    offscreen = false,
}: AlternativeCashFlowProps) {
    const graphId = offscreen ? `${OFFSCREEN_GRAPH_ID_TEMPLATE}-${selection}` : GRAPH_ID;

    const [chart, setChart] = useState<Chart>();
    const [graphIsNotEmpty, setGraphIsNotEmpty] = useState<boolean>(true);

    useLayoutEffect(() => {
        if (!chart) return;

        const columns = getColumns(selection, optionals, discountedCashFlow);
        setGraphIsNotEmpty(
            columns.map((column) => column.slice(1).some((val) => val !== 0)).some((hasNonZero) => hasNonZero),
        );

        if (!graphIsNotEmpty) return;
        chart.groups([Array.from(ResultModel.categoryToDisplayName.values())]);

        chart.unload({
            done: () => chart.load({ columns: columns }),
        });
    }, [chart, selection, optionals, discountedCashFlow, graphIsNotEmpty]);

    useEffect(() => {
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
            bar: {
                padding: 0,
            },
            legend: {
                show: true,
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
            {(graphIsNotEmpty && (
                <div id={graphId} className={`h-[23rem]${offscreen ? ` ${OFFSCREEN_GRAPH_CLASS}` : ""}`} />
            )) || <p className={OFFSCREEN_GRAPH_CLASS}>{Strings.NO_FINANCIAL_DATA_AVAILABLE}</p>}
        </>
    );
}
