import { type Cost, CostTypes, DollarMethod, type ImplementationContractCost } from "blcc-format/Format";
import { NumberInput } from "components/input/InputNumber";
import { Strings } from "constants/Strings";
import type { Collection } from "dexie";
import { useDbUpdate } from "hooks/UseDbUpdate";
import { CostModel } from "model/CostModel";
import { useMemo } from "react";
import { type Observable, Subject, distinctUntilChanged, merge } from "rxjs";
import { filter, map, tap } from "rxjs/operators";
import cost = CostModel.cost;
import * as O from "optics-ts";
import { ValueRateOfChange } from "components/Recurring";
import { TestNumberInput } from "components/input/TestNumberInput";
import { calculateNominalDiscountRate, getDefaultRateOfChange, toDecimal, toPercentage } from "util/Util";
import { Var } from "util/var";
import { isImplementationContractCost } from "model/Guards";
import { Model } from "model/Model";
import { Defaults } from "blcc-format/Defaults";

/**
 * Component for the implementation contract fields in the cost pages
 */
export default function ImplementationContractCostFields() {
    // Set up streams
    const [sCost$, cost$, sOccurrence$, occurrence$, collection$, valueRateOfChange] = useMemo(() => {
        // If we are on this page that means the cost collection can be narrowed to ImplementationContract
        const collection$ = CostModel.collection$ as Observable<Collection<ImplementationContractCost, number>>;

        const contractCost$ = cost.$.pipe(
            filter((cost): cost is ImplementationContractCost => cost.type === CostTypes.IMPLEMENTATION_CONTRACT),
        );

        const sCost$ = new Subject<number | undefined>();
        const cost$ = merge(sCost$, contractCost$.pipe(map((cost) => cost.cost))).pipe(distinctUntilChanged());

        const sOccurrence$ = new Subject<number | undefined>();
        const occurrence$ = merge(sOccurrence$, contractCost$.pipe(map((cost) => cost.occurrence))).pipe(
            distinctUntilChanged(),
        );

        const costOptic = O.optic<Cost>().guard(isImplementationContractCost);
        const valueRateOfChange = new Var(CostModel.cost, costOptic.prop("valueRateOfChange"));

        return [sCost$, cost$, sOccurrence$, occurrence$, collection$, valueRateOfChange];
    }, []);

    useDbUpdate(sCost$, collection$, "cost");
    useDbUpdate(sOccurrence$, collection$, "occurrence");

    const isSavings = CostModel.costOrSavings.use();

    const defaultRateOfChange = getDefaultRateOfChange(Model.dollarMethod.current());

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <NumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    label={isSavings ? "Initial Cost Savings" : "Initial Cost"}
                    subLabel={"(Base Year Dollars)"}
                    allowEmpty={true}
                    value$={cost$}
                    wire={sCost$}
                    info={Strings.INITIAL_COST_INFO}
                />
                <NumberInput
                    className={"w-full"}
                    info={Strings.OCCURRENCE}
                    addonAfter={"years"}
                    label={"Initial Occurrence"}
                    subLabel={"(from service date)"}
                    allowEmpty={true}
                    value$={occurrence$}
                    wire={sOccurrence$}
                />
                <TestNumberInput
                    className={"w-full"}
                    addonAfter={"%"}
                    controls
                    label={"Value Rate of Change"}
                    getter={() => toPercentage(valueRateOfChange.use() ?? defaultRateOfChange)}
                    onChange={(val) => valueRateOfChange.set(toDecimal(val ?? defaultRateOfChange))}
                    info={Strings.VALUE_RATE_OF_CHANGE_INFO}
                />
            </div>
        </div>
    );
}
