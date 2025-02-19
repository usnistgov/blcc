import { Radio, type RadioChangeEvent, Switch } from "antd";
import Title from "antd/es/typography/Title";
import { ResultModel } from "model/ResultModel";

export function ResultsSwitch({ ...defaultProps }) {
    const discountedCashFlow = ResultModel.useDiscountedCashFlow();
    
    const onChange = (e: RadioChangeEvent) => {
        e.target.value === "discounted" ? ResultModel.setDiscountedCashFlow(true) : ResultModel.setDiscountedCashFlow(false);
    };
    
    return <div className="w-1/5">
        <Title level={5}>Discounted/Non-Discounted Cash Flow</Title>
        <Radio.Group onChange={onChange} defaultValue={discountedCashFlow ? "discounted" : "non-discounted"} buttonStyle="solid">
            <Radio.Button value="discounted">Discounted</Radio.Button>
            <Radio.Button value="non-discounted">Non-Discounted</Radio.Button>
        </Radio.Group>
    </div>
}