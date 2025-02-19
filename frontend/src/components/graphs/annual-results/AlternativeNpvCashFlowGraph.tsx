import type { Optional } from "@lrd/e3-sdk";
import { createSignal } from "@react-rxjs/utils";
import { type Chart, bb } from "billboard.js";
import { useSubscribe } from "hooks/UseSubscribe";
import { alternatives$ } from "model/Model";
import { ResultModel } from "model/ResultModel";
import { useEffect } from "react";
import { combineLatest } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { dollarFormatter } from "util/Util";

/* Tags to grab from optional */
const categories = [
    "Initial Investment",
    "Energy",
    "Demand Charge",
    "Rebate",
    "Usage",
    "Disposal",
    "OMR",
    "Recurring Contract Cost",
    "Implementation Contract Cost",
    "Replacement Capital",
    "Residual Value",
    "Other"
]

/* Map optional tags to display friendly names */
const categoryToDisplayName = new Map<string, string>([
    ["Initial Investment", "Initial Investment"],
    ["Energy", "Energy Consumption"],
    ["Demand Charge", "Energy Demand"],
    ["Rebate", "Energy Rebates"],
    ["Usage", "Water Usage"],
    ["Disposal", "Water Disposal"],
    ["OMR", "OMR"],
    ["Recurring Contract Cost", "Recurring Contract"],
    ["Implementation Contract Cost", "Implementation Contract"],
    ["Replacement Capital", "Replacement Capital"],
    ["Residual Value", "Residual Value"],
    ["Other", "Other"]
]);

/*  Type representing format of data columns: an array of arrays with a string identifier as the first item followed by numbers */
type AlternativeNpvCashFlowGraphColumns = ([(string | number)[], (string | number)[]] | [(string | number)[]] | []);

const GRAPH_ID = "alternative-npv-cash-flow-chart";

const [chart$, setChart] = createSignal<Chart>();
const loadData$ = combineLatest([ResultModel.selection$, chart$, ResultModel.required$, ResultModel.optionalsByTag$]).pipe(
    debounceTime(1),
);


function getColumn(altId: number, optionals: Map<string, Optional>, category: string) {
    const key = `${altId} ${category}`;
    const tag = categoryToDisplayName.get(category) ?? "";

    return [tag, ...(optionals.get(key)?.totalTagCashflowDiscounted ?? [])]
}

function getColumns(altId: number, optionals: Map<string, Optional>): AlternativeNpvCashFlowGraphColumns {
    let columns: AlternativeNpvCashFlowGraphColumns = [];
    for (const category of categories) {
        columns = [getColumn(altId, optionals, category), ...columns];
    }
    return columns;
}

export default function AlternativeNpvCashFlowGraph() {
    useSubscribe(loadData$, ([selection, chart, allRequired, optionals]) => {
        const required = allRequired.find((req) => req.altId === selection);

        if (required === undefined) return [];
    
        // Grab data columns
        const columns = getColumns(required.altId, optionals);

        // This line groups together all categories so they are stacked
        chart.groups([Array.from(categoryToDisplayName.values())]);

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

    return <div id={GRAPH_ID} className={"h-[23rem] w-full"} />;
}
