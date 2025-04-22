import { bind } from "@react-rxjs/core";
import { Divider } from "antd";
import { Model } from "model/Model";
import { CapitalCostModel } from "model/costs/CapitalCostModel";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { distinctUntilChanged, map } from "rxjs";
import { tap, withLatestFrom } from "rxjs/operators";
import { percentFormatter, resize, toDecimal, toPercentage } from "util/Util";

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

function defaultPhaseIn(n: number): number[] {
    // Create default array with a size equal to the construction period
    const array = Array(n).fill(0);
    // Set the first year to 100% (1.0f)
    array[0] = 1;

    return array;
}

namespace PhaseInModel {
    export const phaseInOrDefault$ = CapitalCostModel.phaseIn.$.pipe(
        withLatestFrom(Model.constructionPeriod.$),
        distinctUntilChanged(),
        map(([phaseIn, constructionPeriod]) => {
            if (phaseIn === undefined) {
                return defaultPhaseIn(constructionPeriod + 1);
            }

            // If phase in is not the correct size, create new array with correct size, and set
            if (phaseIn.length !== constructionPeriod + 1) {
                const newSize = resize(phaseIn, constructionPeriod + 1);
                CapitalCostModel.Actions.setPhaseIn(newSize);
                return newSize;
            }

            return phaseIn;
        }),
    );
    export const [useColumns] = bind(
        phaseInOrDefault$.pipe(
            tap((rate) => console.log("Rate change", rate)),
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
}

export default function PhaseIn() {
    const constructionPeriod = Model.constructionPeriod.use();

    return (
        <div className={"grid grid-cols-2"}>
            <Divider className={"col-span-2"} style={{ fontSize: "20px" }} orientation={"left"} orientationMargin={"0"}>
                Cost-Phasing of Initial Cost
                <p className={"text-base-light text-xs"}>Percentages must add up to 100%</p>
            </Divider>
            {constructionPeriod > 0 ? (
                <div className={"w-full overflow-hidden rounded shadow-lg"}>
                    <DataGrid
                        className={"rdg-light h-full"}
                        rows={PhaseInModel.useColumns()}
                        columns={COLUMNS}
                        onRowsChange={(change) =>
                            // Convert back to flat float array
                            CapitalCostModel.Actions.setPhaseIn(change.map((info) => info.phaseIn))
                        }
                    />
                </div>
            ) : (
                <p className={"text-base-dark"}>No phase in for a construction period of zero years</p>
            )}
        </div>
    );
}
