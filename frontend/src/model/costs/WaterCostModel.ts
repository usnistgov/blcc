import { bind } from "@react-rxjs/core";
import { type Cost, Season, type SeasonUsage, type WaterUnit } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { isWaterCost } from "model/Guards";
import * as O from "optics-ts";
import { map } from "rxjs/operators";
import { guard } from "util/Operators";
import { Var } from "util/var";

export namespace WaterCostModel {
    export enum SeasonOption {
        DUAL = "2 Season",
        QUAD = "4 Season",
    }

    /*
     * Outputs a value if the current cost is a water cost
     */
    export const waterCostOptic = O.optic<Cost>().guard(isWaterCost);

    export const unit = new Var(CostModel.cost, waterCostOptic.prop("unit"));

    export const usage = new Var(CostModel.cost, waterCostOptic.prop("usage"));

    export const [useUsageSeasonNum] = bind(
        usage.$.pipe(
            guard(),
            map((usage) => (usage.length === 2 ? SeasonOption.DUAL : SeasonOption.QUAD)),
        ),
    );

    export const disposal = new Var(CostModel.cost, waterCostOptic.prop("disposal"));

    export const [useDisposalSeasonNum] = bind(
        disposal.$.pipe(
            guard(),
            map((disposal) => (disposal.length === 2 ? SeasonOption.DUAL : SeasonOption.QUAD)),
        ),
    );

    function newSeasons(seasons?: SeasonUsage[]): SeasonUsage[] {
        if (seasons === undefined)
            return [
                {
                    season: Season.SUMMER,
                    amount: 0,
                    costPerUnit: 0,
                },
                {
                    season: Season.WINTER,
                    amount: 0,
                    costPerUnit: 0,
                },
            ];

        if (seasons.length === 4) return [seasons[1], seasons[3]];

        return [
            { season: Season.SPRING, amount: 0, costPerUnit: 0 } as SeasonUsage,
            seasons[0],
            { season: Season.AUTUMN, amount: 0, costPerUnit: 0 } as SeasonUsage,
            seasons[1],
        ];
    }

    export namespace Actions {
        export function setUnit(newUnit: WaterUnit) {
            unit.set(newUnit);
        }

        export function toggleUsageSeasonNum() {
            usage.modify(newSeasons);
        }

        export function setUsageAmount(index: number, value: number | null) {
            if (value === null) return;

            usage.modify((usage) => {
                const newObj = [...usage];
                newObj[index].amount = value;
                return newObj;
            });
        }

        export function setUsageCost(index: number, value: number | null) {
            if (value === null) return;

            usage.modify((usage) => {
                const newObj = [...usage];
                newObj[index].costPerUnit = value;
                return newObj;
            });
        }

        export function toggleDisposalSeasonNum() {
            disposal.modify(newSeasons);
        }

        export function setDisposalAmount(index: number, value: number | null) {
            if (value === null) return;

            disposal.modify((disposal) => {
                const newObj = [...disposal];
                newObj[index].amount = value;
                return newObj;
            });
        }

        export function setDisposalCost(index: number, value: number | null) {
            if (value === null) return;

            disposal.modify((disposal) => {
                const newObj = [...disposal];
                newObj[index].costPerUnit = value;
                return newObj;
            });
        }
    }
}
