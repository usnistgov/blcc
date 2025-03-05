import type { Measures, Optional } from "@lrd/e3-sdk";
import { createSignal } from "@react-rxjs/utils";
import { type Chart, bb } from "billboard.js";
import { useSubscribe } from "hooks/UseSubscribe";
import { alternatives$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import { useEffect } from "react";
import { combineLatest, iif, of } from "rxjs";
import { combineLatestWith, startWith } from "rxjs/operators";
import { guard } from "util/Operators";
import { dollarFormatter } from "util/Util";

/*  Type representing format of data columns: an array of arrays with a string identifier as the first item followed by numbers */
type AlternativeNpvCashFlowGraphColumns = [(string | number)[], (string | number)[]] | [(string | number)[]] | [];

const GRAPH_ID = "alternative-npv-cash-flow-chart";
export const OFFSCREEN_GRAPH_ID_TEMPLATE = `offscreen-${GRAPH_ID}`;
export const OFFSCREEN_GRAPH_CLASS = `offscreen-${GRAPH_ID}`;

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = combineLatest([
    ResultModel.selection$,
    chart$,
    ResultModel.required$,
    ResultModel.optionalsByTag$,
    ResultModel.discountedCashFlow$.pipe(startWith(true)),
]);

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
    measure?: Measures;
    offscreen?: boolean;
};
export default function AlternativeCashFlowGraph({ measure, offscreen = false }: AlternativeCashFlowProps) {
    const graphId = offscreen ? `${OFFSCREEN_GRAPH_ID_TEMPLATE}-${measure?.altId}` : GRAPH_ID;

    useSubscribe(
        iif(
            () => measure !== undefined,
            of(0).pipe(
                guard(),
                combineLatestWith(chart$, ResultModel.required$, ResultModel.optionalsByTag$, of(true)),
            ),
            loadData$,
        ),
        ([selection, chart, allRequired, optionals, discountedCashFlow]) => {
            const required = allRequired.find((req) => req.altId === selection);
            console.log(allRequired, optionals);

            if (required === undefined) return [];

            // Grab data columns
            const columns = getColumns(required.altId, optionals, discountedCashFlow);
            console.log(columns);
            console.log(graphId);

            // This line groups together all categories so they are stacked
            chart.groups([Array.from(ResultModel.categoryToDisplayName.values())]);

            chart.unload({
                done: () => chart.load({ columns: columns }),
            });
        },
    );

    useEffect(() => {
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
    }, [graphId]);

    return <div id={graphId} className={`h-[23rem]${offscreen ? ` ${OFFSCREEN_GRAPH_CLASS}` : ""}`} />;
}
