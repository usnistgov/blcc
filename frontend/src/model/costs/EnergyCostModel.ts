import { createSignal } from "@react-rxjs/utils";
import { combineLatest, distinctUntilChanged, map, merge } from "rxjs";
import { filter } from "rxjs/operators";
import { CostTypes, CustomerSector, type EnergyCost } from "../../blcc-format/Format";
import { guard } from "../../util/Operators";
import { cost$, costCollection$ } from "../CostModel";

/**
 * Outputs a value if the current cost is an energy cost
 */
export const energyCost$ = cost$.pipe(filter((cost): cost is EnergyCost => cost.type === CostTypes.ENERGY));

export const fuelType$ = energyCost$.pipe(map((cost) => cost.fuelType));
export const sector$ = energyCost$.pipe(map((cost) => cost?.customerSector ?? CustomerSector.RESIDENTIAL));

export const [rateChange$, rateChange] = createSignal<number | number[]>();
export const escalation$ = merge(
    rateChange$,
    energyCost$.pipe(
        map((cost) => cost.escalation),
        guard(),
    ),
).pipe(distinctUntilChanged());
combineLatest([rateChange$, costCollection$]).subscribe(([newRates, costCollection]) =>
    costCollection.modify({ escalation: newRates }),
);

export const [useIndexChange$, useIndexChange] = createSignal<number | number[]>();
export const useIndex$ = merge(useIndexChange$, energyCost$.pipe(map((cost) => cost.useIndex))).pipe(
    distinctUntilChanged(),
);
combineLatest([useIndexChange$, costCollection$]).subscribe(([newRates, costCollection]) =>
    costCollection.modify({ useIndex: newRates }),
);
