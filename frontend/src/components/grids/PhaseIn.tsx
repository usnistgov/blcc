import { state, useStateObservable } from "@react-rxjs/core";
import { Divider } from "antd";
import type { CapitalCost } from "blcc-format/Format";
import type { Collection } from "dexie";
import { CostModel } from "model/CostModel";
import { Model } from "model/Model";
import { CapitalCostModel } from "model/costs/CapitalCostModel";
import React, { useEffect, useMemo } from "react";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { combineLatest, map } from "rxjs";
import { filter, withLatestFrom } from "rxjs/operators";
import { percentFormatter, toDecimal, toPercentage } from "util/Util";

type PhaseInRateInfo = {
    year: number;
    phaseIn: number;
};
const COLUMNS = [
    {
        name: "Year",
        key: "year",
    },
    {
        name: "Phase In (%)",
        key: "phaseIn",
        renderEditCell: ({ row, column, onRowChange }: RenderEditCellProps<PhaseInRateInfo>) => {
            return (
                <input
                    className={"w-full pl-4"}
                    type={"number"}
                    defaultValue={toPercentage(row.phaseIn)}
                    onChange={(event) =>
                        onRowChange({
                            ...row,
                            [column.key]: toDecimal(event.currentTarget.value),
                        })
                    }
                />
            );
        },
        editable: true,
        renderCell: (info: RenderCellProps<PhaseInRateInfo>) => {
            return percentFormatter.format(info.row.phaseIn);
        },
    },
];

export default function PhaseIn() {
    const [default$, rates$] = useMemo(() => {
        const default$ = combineLatest([CapitalCostModel.phaseIn$, Model.constructionPeriod.$]).pipe(
            filter(([phaseIn, constructionPeriod]) => constructionPeriod > 0 && phaseIn === undefined),
            map(([phaseIn, constructionPeriod]) => {
                // Create default array with a size equal to the construction period
                const array = Array(constructionPeriod).fill(0);
                // Set the first year to 100% (1.0f)
                array[0] = 1;

                return array;
            }),
            withLatestFrom(CostModel.collection$),
        );

        const rates$ = state(
            CapitalCostModel.phaseIn$.pipe(
                map(
                    (rates) =>
                        rates?.map(
                            (rate, i) =>
                                ({
                                    year: i,
                                    phaseIn: rate,
                                }) as PhaseInRateInfo,
                        ) ?? [],
                ),
            ),
        );

        return [default$, rates$];
    }, []);

    useEffect(() => {
        const subscription = default$.subscribe(([phaseIn, collection]) =>
            (collection as Collection<CapitalCost>).modify({ phaseIn }),
        );

        return () => subscription.unsubscribe();
    }, [default$]);

    const constructionPeriod = Model.constructionPeriod.use();
    const rates = useStateObservable(rates$);

    return (
        <div className={"grid grid-cols-2"}>
            <Divider className={"col-span-2"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                Cost-Phasing of Initial Cost
                <p className={"text-xs text-base-light"}>Percentages must add up to 100%</p>
            </Divider>
            {constructionPeriod > 0 ? (
                <div className={"w-full overflow-hidden rounded shadow-lg"}>
                    <DataGrid
                        className={"h-full rdg-light"}
                        rows={rates}
                        columns={COLUMNS}
                        onRowsChange={(change) =>
                            // Convert back to flat float array
                            CapitalCostModel.sPhaseInChange$.next(change.map((info) => info.phaseIn))
                        }
                    />
                </div>
            ) : (
                <p className={"text-base-dark"}>No phase in for a construction period of zero years</p>
            )}
        </div>
    );
}
