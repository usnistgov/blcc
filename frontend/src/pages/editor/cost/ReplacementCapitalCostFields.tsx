import numberInput from "../../../components/InputNumber";
import switchComp from "../../../components/Switch";
import { Typography } from "antd";
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";

const { Title } = Typography;

const [dollarOrPercent$, setDollarOrPercent] = createSignal<boolean>();
const [useDollarOrPercent] = bind(dollarOrPercent$, false);

const { component: InitialCostInput } = numberInput();
const { component: AnnualRateOfChangeInput } = numberInput();
const { component: ExpectedLifeInput } = numberInput();
const { component: ResidualValueSwitch, onChange$: dollarOrPercentChange$ } = switchComp(dollarOrPercent$);
const { component: ResidualValue } = numberInput();

export default function ReplacementCapitalCostFields() {
    const dollarOrPercent = useDollarOrPercent();
    dollarOrPercentChange$.subscribe(setDollarOrPercent);

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
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
                <span className={"flex flex-col"}>
                    <Title level={5}>Residual Value</Title>
                    <span>
                        <ResidualValueSwitch unCheckedChildren={"Dollar"} checkedChildren={"Percent"} />
                    </span>
                    <ResidualValue
                        className={"py-4"}
                        addonBefore={!dollarOrPercent ? "$" : undefined}
                        addonAfter={dollarOrPercent ? "%" : undefined}
                    />
                </span>
            </div>
        </div>
    );
}
