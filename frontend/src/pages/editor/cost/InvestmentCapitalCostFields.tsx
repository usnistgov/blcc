import numberInput from "../../../components/InputNumber";
import { phaseIn } from "../../../components/PhaseIn";
import { cost$, costCollection$ as baseCostCollection$ } from "../../../model/CostModel";
import { filter, Observable } from "rxjs";
import { CapitalCost, CostTypes } from "../../../blcc-format/Format";
import { map } from "rxjs/operators";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { Collection } from "dexie";

// If we are on this page that means the cost collection can be narrowed to CapitalCost.
const costCollection$ = baseCostCollection$ as Observable<Collection<CapitalCost, number>>;
const capitalCost$ = cost$.pipe(filter((cost): cost is CapitalCost => cost.type === CostTypes.CAPITAL));

const { component: InitialCostInput, onChange$: initialCost$ } = numberInput(
    capitalCost$.pipe(map((cost) => cost.initialCost)),
    true
);
const { component: AnnualRateOfChangeInput, onChange$: rateOfChange$ } = numberInput(
    capitalCost$.pipe(map((cost) => cost.annualRateOfChange)),
    true
);
const { component: ExpectedLifeInput, onChange$: expectedLife$ } = numberInput(
    capitalCost$.pipe(map((cost) => cost.expectedLife)),
    true
);
const { component: CostAdjustmentFactorInput, onChange$: costAdjustment$ } = numberInput(
    capitalCost$.pipe(map((cost) => cost.costAdjustment)),
    true
);
const { component: AmountFinancedInput, onChange$: amountFinanced$ } = numberInput(
    capitalCost$.pipe(map((cost) => cost.amountFinanced)),
    true
);
const { component: PhaseIn } = phaseIn();
const { component: EscalationRate } = phaseIn();

export default function InvestmentCapitalCostFields() {
    useDbUpdate(initialCost$, costCollection$, "initialCost");
    useDbUpdate(rateOfChange$, costCollection$, "annualRateOfChange");
    useDbUpdate(expectedLife$, costCollection$, "expectedLife");
    useDbUpdate(costAdjustment$, costCollection$, "costAdjustment");
    useDbUpdate(amountFinanced$, costCollection$, "amountFinanced");

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <InitialCostInput
                    className={"w-full"}
                    label={"Initial Cost (Base Year Dollars)"}
                    addonBefore={"$"}
                    controls
                />
                <AmountFinancedInput className={"w-full"} label={"Amount Financed"} addonBefore={"$"} controls />

                <div className={"col-span-2 grid grid-cols-3 gap-x-16 gap-y-4"}>
                    <ExpectedLifeInput className={"w-full"} label={"Expected Lifetime"} addonAfter={"years"} controls />
                    <AnnualRateOfChangeInput
                        className={"w-full"}
                        label={"Annual Rate of Change"}
                        addonAfter={"%"}
                        controls
                    />
                    <CostAdjustmentFactorInput
                        className={"w-full"}
                        label={"Cost Adjustment Factor"}
                        addonAfter={"%"}
                        controls
                    />
                </div>

                <PhaseIn />
                <EscalationRate />
            </div>
        </div>
    );
}
