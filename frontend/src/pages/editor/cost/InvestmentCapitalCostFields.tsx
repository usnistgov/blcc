import numberInput from "../../../components/InputNumber";

const { component: InitialCostInput } = numberInput();
const { component: AnnualRateOfChangeInput } = numberInput();
const { component: ExpectedLifeInput } = numberInput();
const { component: CostAdjustmentFactorInput } = numberInput();

export default function InvestmentCapitalCostFields() {
    return (
        <div className={"flex flex-col"}>
            <div className={"flex flex-row"}>
                <InitialCostInput label={"Initial Cost (Base Year Dollars)"} before={"$"} controls />
                <AnnualRateOfChangeInput label={"Annual Rate of Change"} after={"%"} controls />
                <ExpectedLifeInput label={"Expected Lifetime"} after={"years"} controls />
            </div>
            <div className={"flex flex-row"}>
                <CostAdjustmentFactorInput label={"Cost Adjustment Factor"} after={"%"} controls />
            </div>
        </div>
    );
}
