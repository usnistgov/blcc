import type { Optional } from "@lrd/e3-sdk";
import type { Chart } from "billboard.js";
import bb from "billboard.js";
import { Strings } from "constants/Strings";
import { ResultModel } from "model/ResultModel";
import { useEffect, useLayoutEffect, useState } from "react";
import { dollarFormatter } from "util/Util";

/*  Type representing format of data columns: an array of arrays with a string identifier as the first item followed by numbers */
type TagObjectByYearGraphColumns = [(string | number)[], (string | number)[]] | [(string | number)[]] | [];

const GRAPH_ID = "tag-object-by-year-chart";

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

type TagObjectByYearProps = {
    selection: number;
    optionals: Map<string, Optional>;
    discountedCashFlow: boolean;
    categorySelection: string;
};
export default function TagObjectByYearGraph({
    selection,
    optionals,
    discountedCashFlow,
    categorySelection,
}: TagObjectByYearProps) {
    const [chart, setChart] = useState<Chart>();
    const [graphIsNotEmpty, setGraphIsNotEmpty] = useState<boolean>(true);

    useLayoutEffect(() => {
        if (!chart) return;

        const columns = getColumn(selection, categorySelection, optionals, discountedCashFlow);
        setGraphIsNotEmpty(
            columns.map((column) => column.slice(1).some((val) => val !== 0)).some((hasNonZero) => hasNonZero),
        );
        if (!graphIsNotEmpty) return;

        chart.unload({
            done: () => chart.load({ columns: columns }),
        });
    }, [chart, selection, optionals, discountedCashFlow, categorySelection, graphIsNotEmpty]);

    useEffect(() => {
        if (!graphIsNotEmpty) return;
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
    }, [graphIsNotEmpty]);

    return (
        <>
            {(graphIsNotEmpty && <div id={GRAPH_ID} className={"h-[23rem] w-full"} />) || (
                <p>{Strings.NO_FINANCIAL_DATA_AVAILABLE}</p>
            )}
        </>
    );
}
