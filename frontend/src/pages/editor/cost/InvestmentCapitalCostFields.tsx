import numberInput from "../../../components/InputNumber";

const { component: InitialCostInput } = numberInput();
const { component: AnnualRateOfChangeInput } = numberInput();
const { component: ExpectedLifeInput } = numberInput();
const { component: CostAdjustmentFactorInput } = numberInput();

export default function InvestmentCapitalCostFields() {
    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                <InitialCostInput label={"Initial Cost (Base Year Dollars)"} addonBefore={"$"} controls />
                <AnnualRateOfChangeInput label={"Annual Rate of Change"} addonAfter={"%"} controls />
                <ExpectedLifeInput label={"Expected Lifetime"} addonAfter={"years"} controls />
                <CostAdjustmentFactorInput label={"Cost Adjustment Factor"} addonAfter={"%"} controls />
            </div>
        </div>
    );
}
