import numberInput from "../../../components/InputNumber";
import { phaseIn } from "../../../components/PhaseIn";

const { component: InitialCostInput } = numberInput();
const { component: AnnualRateOfChangeInput } = numberInput();
const { component: ExpectedLifeInput } = numberInput();
const { component: CostAdjustmentFactorInput } = numberInput();
const { component: PhaseIn } = phaseIn();
const { component: EscalationRate } = phaseIn();

export default function InvestmentCapitalCostFields() {
    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <InitialCostInput
                    className={"w-full"}
                    label={"Initial Cost (Base Year Dollars)"}
                    addonBefore={"$"}
                    controls
                />
                <AnnualRateOfChangeInput
                    className={"w-full"}
                    label={"Annual Rate of Change"}
                    addonAfter={"%"}
                    controls
                />
                <ExpectedLifeInput className={"w-full"} label={"Expected Lifetime"} addonAfter={"years"} controls />
                <CostAdjustmentFactorInput
                    className={"w-full"}
                    label={"Cost Adjustment Factor"}
                    addonAfter={"%"}
                    controls
                />
                <PhaseIn />
                <EscalationRate />
            </div>
        </div>
    );
}
