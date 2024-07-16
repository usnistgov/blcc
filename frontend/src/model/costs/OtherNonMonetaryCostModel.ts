import { state } from "@react-rxjs/core";
import { CostTypes, type OtherNonMonetary } from "blcc-format/Format";
import { CostModel } from "model/CostModel";
import { Subject, distinctUntilChanged, merge } from "rxjs";
import { filter, map, withLatestFrom } from "rxjs/operators";

export namespace OtherNonMonetaryCostModel {
    /**
     * The cost stream narrowed to an OtherCost
     */
    export const cost$ = CostModel.cost$.pipe(
        filter((cost): cost is OtherNonMonetary => cost.type === CostTypes.OTHER_NON_MONETARY),
    );

    /**
     * The tags for the current other cost
     */
    export const sTags$ = new Subject<string[]>();
    export const tags$ = state(merge(sTags$, cost$.pipe(map((cost) => cost.tags))).pipe(distinctUntilChanged()), []);
    sTags$.pipe(withLatestFrom(CostModel.collection$)).subscribe(([tags, collection]) => collection.modify({ tags }));
}
