import { useStateObservable } from "@react-rxjs/core";
import { DollarMethod } from "blcc-format/Format";
import { NumberInput } from "components/input/InputNumber";
import { Model } from "model/Model";

/**
 * Component to display the discount rates for the current project
 */
export default function DiscountRates() {
    const dollarMethod = useStateObservable(Model.dollarMethod$);

    return (
        <div className={"col-span-2 grid grid-cols-3 items-end gap-x-16 gap-y-4"}>
            <NumberInput
                label={"Inflation Rate*"}
                disabled={dollarMethod !== DollarMethod.CURRENT}
                addonAfter={"%"}
                allowEmpty={true}
                controls={false}
                wire={Model.sInflationRate$}
                value$={Model.inflationRate$}
                percent
            />
            <NumberInput
                label={"Nominal Discount Rate*"}
                disabled={dollarMethod !== DollarMethod.CURRENT}
                addonAfter={"%"}
                allowEmpty={true}
                controls={false}
                min={0.0}
                wire={Model.sNominalDiscountRate$}
                value$={Model.nominalDiscountRate$}
                percent
            />
            <NumberInput
                label={"Real Discount Rate*"}
                disabled={dollarMethod !== DollarMethod.CONSTANT}
                addonAfter={"%"}
                allowEmpty={true}
                controls={false}
                min={0.0}
                wire={Model.sRealDiscountRate$}
                value$={Model.realDiscountRate$}
                percent
            />
        </div>
    );
}
