import type { Optional } from "@lrd/e3-sdk";
import { createSignal } from "@react-rxjs/utils";
import type { Chart } from "billboard.js";
import bb from "billboard.js";
import { useSubscribe } from "hooks/UseSubscribe";
import { ResultModel } from "model/ResultModel";
import { useEffect } from "react";
import { combineLatest, debounceTime, startWith } from "rxjs";
import { dollarFormatter } from "util/Util";

/*  Type representing format of data columns: an array of arrays with a string identifier as the first item followed by numbers */
type TagObjectByYearGraphColumns = [(string | number)[], (string | number)[]] | [(string | number)[]] | [];

const GRAPH_ID = "tag-object-by-year-chart";

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = combineLatest([
    ResultModel.selection$,
    chart$,
    ResultModel.required$,
    ResultModel.optionalsByTag$,
    ResultModel.discountedCashFlow$.pipe(startWith(true)),
    ResultModel.categorySelection$,
]).pipe(debounceTime(1));

// Takes in alternative id, name of cost type to show, optionals, whether to use discounted cash flow
function getColumn(
    altId: number,
    categorySelection: string,
    optionals: Map<string, Optional>,
    discountedCashFlow: boolean,
): TagObjectByYearGraphColumns {
    const key = `${altId} ${categorySelection}`;
    const tag = ResultModel.categoryToDisplayName.get(categorySelection) ?? "";
    const results = discountedCashFlow
        ? optionals.get(key)?.totalTagCashflowDiscounted
        : optionals.get(key)?.totalTagCashflowNonDiscounted;
    return [[tag, ...(results ?? [])]];
}

export default function TagObjectByYearGraph() {
    useSubscribe(loadData$, ([selection, chart, allRequired, optionals, discountedCashFlow, categorySelection]) => {
        const required = allRequired.find((req) => req.altId === selection);

        if (required === undefined) return [];

        // Grab data column
        const columns = getColumn(required.altId, categorySelection, optionals, discountedCashFlow);

        chart.unload({
            done: () => chart.load({ columns: columns }),
        });
    });

    useEffect(() => {
        const chart = bb.generate({
            data: {
                columns: [],
                type: "bar",
            },
            bindto: `#${GRAPH_ID}`,
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
                show: false,
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
    }, []);

    return (
        <>
            <div id={GRAPH_ID} className={"h-[23rem] w-full"} />
        </>
    );
}
