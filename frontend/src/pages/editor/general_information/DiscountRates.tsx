import { DollarMethod } from "blcc-format/Format";
import { TestNumberInput } from "components/input/TestNumberInput";
import { Strings } from "constants/Strings";
import { Model } from "model/Model";

/**
 * Component to display the discount rates for the current project
 */
export default function DiscountRates() {
    const dollarMethod = Model.dollarMethod.use();

    return (
        <div className={"col-span-2 grid grid-cols-3 items-end gap-x-4 gap-y-4"}>
            <TestNumberInput
                label={"Inflation Rate"}
                required
                info={Strings.INFLATION_RATE}
                disabled={dollarMethod !== DollarMethod.CURRENT}
                addonAfter={"%"}
                controls={false}
                getter={Model.inflationRate.use}
                onChange={(value) => Model.inflationRate.set(value ?? undefined)}
            />
            <TestNumberInput
                label={"Nominal Discount Rate"}
                required
                id={"nominal-discount-rate"}
                info={Strings.NOMINAL_DISCOUNT_RATE}
                disabled={dollarMethod !== DollarMethod.CURRENT}
                addonAfter={"%"}
                controls={false}
                min={0.0}
                getter={Model.nominalDiscountRate.use}
                onChange={(value) => Model.nominalDiscountRate.set(value ?? undefined)}
            />
            <TestNumberInput
                label={"Real Discount Rate"}
                required
                info={Strings.REAL_DISCOUNT_RATE}
                disabled={dollarMethod !== DollarMethod.CONSTANT}
                addonAfter={"%"}
                controls={false}
                min={0.0}
                getter={Model.realDiscountRate.use}
                onChange={(value) => Model.realDiscountRate.set(value ?? undefined)}
            />
        </div>
    );
}
