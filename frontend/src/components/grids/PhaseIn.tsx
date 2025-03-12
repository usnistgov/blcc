import { bind } from "@react-rxjs/core";
import { Divider } from "antd";
import { Model } from "model/Model";
import { CapitalCostModel } from "model/costs/CapitalCostModel";
import DataGrid, { type RenderCellProps, type RenderEditCellProps } from "react-data-grid";
import { map } from "rxjs";
import { withLatestFrom } from "rxjs/operators";
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

function defaultPhaseIn(constructionPeriod: number): number[] {
    // Create default array with a size equal to the construction period
    const array = Array(constructionPeriod).fill(0);
    // Set the first year to 100% (1.0f)
    array[0] = 1;

    return array;
}

function resize(array: number[], length: number) {
    // If array is shorter than length, pad with zeros
    if (array.length < length) {
        return [...array, ...Array(length - array.length).fill(0)];
    }

    // If array is longer than length, truncate to length
    return array.slice(0, length);
}

namespace PhaseInModel {
    export const phaseInOrDefault$ = CapitalCostModel.phaseIn.$.pipe(
        withLatestFrom(Model.constructionPeriod.$),
        map(([phaseIn, constructionPeriod]) => {
            if (phaseIn === undefined) {
                return defaultPhaseIn(constructionPeriod);
            }

            // If phase in is not the correct size, create new array with correct size, and set
            if (phaseIn.length !== constructionPeriod) {
                const newSize = resize(phaseIn, constructionPeriod);
                CapitalCostModel.Actions.setPhaseIn(newSize);
                return newSize;
            }

            return phaseIn;
        }),
    );
    export const [useColumns] = bind(
        phaseInOrDefault$.pipe(
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
