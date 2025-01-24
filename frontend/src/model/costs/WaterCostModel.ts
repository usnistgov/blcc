import { state } from "@react-rxjs/core";
import { CostTypes, LiquidUnit, Season, type SeasonUsage, type WaterCost, type WaterUnit } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { type Observable, Subject, distinctUntilChanged, merge, sample } from "rxjs";
import { filter, map, withLatestFrom } from "rxjs/operators";
import cost = CostModel.cost;
import type { Collection } from "dexie";

export namespace WaterCostModel {
    /*
     * Outputs a value if the current cost is a water cost
     */
    export const cost$ = cost.$.pipe(filter((cost): cost is WaterCost => cost.type === CostTypes.WATER));
    const collection$ = CostModel.collection$ as Observable<Collection<WaterCost>>;

    export const sUnit$ = new Subject<WaterUnit>();
    export const unit$ = state(
        merge(sUnit$, cost$.pipe(map((cost) => cost.unit)).pipe(distinctUntilChanged())),
        LiquidUnit.GALLON as WaterUnit,
    );
    sUnit$.pipe(withLatestFrom(collection$)).subscribe(([unit, collection]) => collection.modify({ unit }));

    export enum SeasonOption {
        DUAL = "2 Season",
        QUAD = "4 Season",
    }

    export const usage$ = state(merge(cost$.pipe(map((cost) => cost.usage ?? []))).pipe(distinctUntilChanged()), []);

    export const sUsageSeasonNum$ = new Subject<SeasonOption>();
    export const usageSeasonNum$ = state(
        merge(
            sUsageSeasonNum$,
            usage$.pipe(map((usage) => (usage.length === 2 ? SeasonOption.DUAL : SeasonOption.QUAD))),
        ).pipe(distinctUntilChanged()),
        SeasonOption.DUAL,
    );
    sUsageSeasonNum$
        .pipe(withLatestFrom(collection$, usage$))
        .subscribe(([seasonNum, collection, usage]) => collection.modify({ usage: newSeasons(usage) }));

    export const sUsageAmount$ = new Subject<[number, number]>();
    sUsageAmount$.pipe(withLatestFrom(collection$)).subscribe(([[index, usage], collection]) =>
        collection.modify((obj) => {
            obj.usage[index].amount = usage;
        }),
    );

    export const sUsageCost$ = new Subject<[number, number]>();
    sUsageCost$.pipe(withLatestFrom(collection$)).subscribe(([[index, cost], collection]) => {
        collection.modify((obj) => {
            obj.usage[index].costPerUnit = cost;
        });
    });

    export const disposal$ = state(
        merge(cost$.pipe(map((cost) => cost.disposal ?? []))).pipe(distinctUntilChanged()),
        [],
    );

    export const sDisposalSeasonNum$ = new Subject<SeasonOption>();
    export const disposalSeasonNum$ = state(
        merge(
            sDisposalSeasonNum$,
            disposal$.pipe(map((disposal) => (disposal.length === 2 ? SeasonOption.DUAL : SeasonOption.QUAD))),
        ).pipe(distinctUntilChanged()),
        SeasonOption.DUAL,
    );
    disposal$
        .pipe(withLatestFrom(collection$), sample(sDisposalSeasonNum$))
        .subscribe(([disposal, collection]) => collection.modify({ disposal: newSeasons(disposal) }));

    export const sDisposalAmount$ = new Subject<[number, number]>();
    sDisposalAmount$.pipe(withLatestFrom(collection$)).subscribe(([[index, disposal], collection]) => {
        collection.modify((obj) => {
            obj.disposal[index].amount = disposal;
        });
    });

    export const sDisposalCost$ = new Subject<[number, number]>();
    sDisposalCost$.pipe(withLatestFrom(collection$)).subscribe(([[index, cost], collection]) => {
        collection.modify((obj) => {
            obj.disposal[index].costPerUnit = cost;
        });
    });

    function newSeasons(seasons: SeasonUsage[]): SeasonUsage[] {
        if (seasons.length === 4) return [seasons[1], seasons[3]];

        return [
            { season: Season.SPRING, amount: 0, costPerUnit: 0 } as SeasonUsage,
            seasons[0],
            { season: Season.AUTUMN, amount: 0, costPerUnit: 0 } as SeasonUsage,
            seasons[1],
        ];
    }
}
