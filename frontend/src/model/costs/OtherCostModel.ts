import { state } from "@react-rxjs/core";
import type { SelectProps } from "antd";
import { CostTypes, type OtherCost, type OtherNonMonetary } from "blcc-format/Format";
import { liveQuery } from "dexie";
import { CostModel } from "model/CostModel";
import { db } from "model/db";
import { Subject, distinctUntilChanged, from, merge } from "rxjs";
import { filter, map, withLatestFrom } from "rxjs/operators";

export namespace OtherCostModel {
    /**
     * The cost stream narrowed to an OtherCost
     */
    export const cost$ = CostModel.cost$.pipe(filter((cost): cost is OtherCost => cost.type === CostTypes.OTHER));

    /**
     * Gets a list of all the tags for all Other and Other Non-monetary costs.
     */
    export const allTags$ = state(
        from(
            liveQuery(() =>
                // Get all Other and Other Non-monetary costs from the DB
                db.costs
                    .where("type")
                    .equals(CostTypes.OTHER)
                    .or("type")
                    .equals(CostTypes.OTHER_NON_MONETARY)
                    .toArray(),
            ),
        ).pipe(
            // Combine into a set to get rid of all duplicates
            map((costs) => new Set((costs as (OtherCost | OtherNonMonetary)[]).flatMap((cost) => cost.tags ?? []))),
            // Convert into the format that the ant select input requires
            map((tags): SelectProps["options"] => [...tags].map((tag) => ({ value: tag, label: tag }))),
        ),
        [],
    );

    /**
     * The tags for the current other cost
     */
    export const sTags$ = new Subject<string[]>();
    export const tags$ = state(merge(sTags$, cost$.pipe(map((cost) => cost.tags))).pipe(distinctUntilChanged()), []);
    sTags$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([tags, collection]) => collection.modify({ tags }));

    /**
     * The initial occurrence for the current other cost
     */
    export const sInitialOccurrence$ = new Subject<number>();
    export const initialOccurrence$ = state(
        merge(sInitialOccurrence$, cost$.pipe(map((cost) => cost.initialOccurrence))).pipe(distinctUntilChanged()),
        0,
    );
    sInitialOccurrence$
        .pipe(withLatestFrom(CostModel.collection$))
        .subscribe(([initialOccurrence, collection]) => collection.modify({ initialOccurrence }));
}
