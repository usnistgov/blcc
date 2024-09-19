import { useStateObservable } from "@react-rxjs/core";
import { CostTypes, type ReplacementCapitalCost } from "blcc-format/Format";
import ResidualValue from "components/ResidualValue";
import { NumberInput } from "components/input/InputNumber";
import type { Collection } from "dexie";
import { useDbUpdate } from "hooks/UseDbUpdate";
import { CostModel } from "model/CostModel";
import { useMemo } from "react";
import { type Observable, Subject, distinctUntilChanged, filter, merge } from "rxjs";
import { map } from "rxjs/operators";
import { defaultValue } from "util/Operators";

// If we are on this page that means the cost collection can be narrowed to ReplacementCapitalCost.
const collection$ = CostModel.collection$ as Observable<Collection<ReplacementCapitalCost, number>>;
const replacementCapitalCost$ = CostModel.cost$.pipe(
    filter((cost): cost is ReplacementCapitalCost => cost.type === CostTypes.REPLACEMENT_CAPITAL),
);

export default function ReplacementCapitalCostFields() {
    const [sInitialCost$, initialCost$, sAnnualRateOfChange$, annualRateOfChange$, sExpectedLife$, expectedLife$] =
        useMemo(() => {
            const sInitialCost$ = new Subject<number>();
            const initialCost$ = merge(
                sInitialCost$,
                replacementCapitalCost$.pipe(map((cost) => cost.initialCost)),
            ).pipe(distinctUntilChanged());

            const sAnnualRateOfChange$ = new Subject<number | undefined>();
            const annualRateOfChange$ = merge(
                sAnnualRateOfChange$,
                replacementCapitalCost$.pipe(map((cost) => cost.annualRateOfChange)),
            ).pipe(distinctUntilChanged());

            const sExpectedLife$ = new Subject<number | undefined>();
            const expectedLife$ = merge(
                sExpectedLife$,
                replacementCapitalCost$.pipe(map((cost) => cost.expectedLife)),
            ).pipe(distinctUntilChanged());

            return [
                sInitialCost$,
                initialCost$,
                sAnnualRateOfChange$,
                annualRateOfChange$,
                sExpectedLife$,
                expectedLife$,
            ];
        }, []);

    useDbUpdate(sInitialCost$.pipe(defaultValue(0)), collection$, "initialCost");
    useDbUpdate(sAnnualRateOfChange$, collection$, "annualRateOfChange");
    useDbUpdate(sExpectedLife$, collection$, "expectedLife");

    const isSavings = useStateObservable(CostModel.costSavings$);

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <NumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    controls
                    label={isSavings ? "Initial Cost Savings (Base Year Dollars)" : "Initial Cost (Base Year Dollars)"}
                    value$={initialCost$}
                    wire={sInitialCost$}
                />
                <NumberInput
                    className={"w-full"}
                    addonAfter={"%"}
                    controls
                    allowEmpty
                    label={"Annual Rate of Change"}
                    value$={annualRateOfChange$}
                    wire={sAnnualRateOfChange$}
                />
                <NumberInput
                    className={"w-full"}
                    addonAfter={"years"}
                    controls
                    label={"Expected Lifetime"}
                    allowEmpty
                    value$={expectedLife$}
                    wire={sExpectedLife$}
                />
            </div>

            <ResidualValue />
        </div>
    );
}
