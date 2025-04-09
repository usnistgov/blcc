import { InputNumber, type InputNumberProps } from "antd";
import Title from "antd/es/typography/Title";
import { DollarMethod } from "blcc-format/Format";
import Info from "components/Info";
import { TestNumberInput } from "components/input/TestNumberInput";
import { Strings } from "constants/Strings";
import { Model } from "model/Model";
import type { ReactNode } from "react";
import { toDecimal, toPercentage } from "util/Util";
import type { ZodError } from "zod";

function Label({ label, info }: { label: string; info: ReactNode }): ReactNode {
    return (
        <Title level={5}>
            <Info text={info}>{label}*</Info>
        </Title>
    );
}

function Field({
    getter,
    error,
    warning,
    disabled,
    ...defaultProps
}: {
    getter: () => number;
    error: () => ZodError | undefined;
    warning?: string;
    disabled: boolean;
} & Omit<InputNumberProps<number>, "value">): ReactNode {
    const err = error?.();
    const value = getter();
    return (
        <div className="flex flex-col">
            <InputNumber
                value={value}
                disabled={disabled}
                {...defaultProps}
                status={!disabled && err ? "error" : warning ? "warning" : undefined}
            />
            {(!disabled &&
                err?.issues.map((error) => (
                    <p key={error.code} style={{ color: "red" }}>
                        {error.message}
                    </p>
                ))) || <p style={{ color: "#faad14" }}>{warning}</p>}
        </div>
    );
}

/**
 * Component to display the discount rates for the current project
 */
export default function DiscountRates() {
    const dollarMethod = Model.dollarMethod.use();
    const inflationRateRef = Model.inflationRate.use();
    const nominalDiscountRateRef = Model.nominalDiscountRate.use();
    const realDiscountRateRef = Model.realDiscountRate.use();
    const rateGetter = (rate: number | undefined) =>
        rate !== undefined ? +toPercentage(rate ?? 0).toFixed(2) : undefined; // Must allow undefined to allow blank values
    const inflationRate = rateGetter(inflationRateRef);
    const nominalDiscountRate = rateGetter(nominalDiscountRateRef);
    const realDiscountRate = rateGetter(realDiscountRateRef);

    const showMagnitudeWarning = (value: number | undefined) =>
        value !== undefined
            ? value < 0.1 && value > -0.1 && value !== 0
                ? "Smaller than expected"
                : undefined
            : undefined;

    return (
        <div className={"col-span-2 grid grid-rows-2 gap-x-4 gap-y-4"}>
            {/* Labels */}
            <div className={"grid grid-cols-3 items-end gap-x-4 gap-y-4"}>
                <Label label={"Inflation Rate"} info={Strings.INFLATION_RATE} />
                <Label label={"Nominal Discount Rate"} info={Strings.NOMINAL_DISCOUNT_RATE} />
                <Label label={"Real Discount Rate"} info={Strings.REAL_DISCOUNT_RATE} />
            </div>

            {/* Fields */}
            <div className={"grid grid-cols-3 items-start gap-x-4 gap-y-4"}>
                <Field
                    getter={() => inflationRate as number} // Must cast to number to pass type check and allow blank values
                    disabled={dollarMethod !== DollarMethod.CURRENT}
                    addonAfter={"%"}
                    controls={false}
                    placeholder=""
                    onChange={(value) => Model.inflationRate.set(value !== null ? toDecimal(value) : undefined)}
                    warning={showMagnitudeWarning(inflationRate)}
                    error={Model.inflationRate.useValidation}
                />
                <Field
                    id={"nominal-discount-rate"}
                    getter={() => nominalDiscountRate as number} // Must cast to number to pass type check and allow blank values
                    disabled={dollarMethod !== DollarMethod.CURRENT}
                    addonAfter={"%"}
                    controls={false}
                    placeholder=""
                    onChange={(value) => Model.nominalDiscountRate.set(value !== null ? toDecimal(value) : undefined)}
                    warning={showMagnitudeWarning(nominalDiscountRate)}
                    error={Model.nominalDiscountRate.useValidation}
                />
                <Field
                    id={"real-discount-rate"}
                    getter={() => realDiscountRate as number} // Must cast to number to pass type check and allow blank values
                    disabled={dollarMethod !== DollarMethod.CONSTANT}
                    addonAfter={"%"}
                    controls={false}
                    placeholder=""
                    onChange={(value) => Model.realDiscountRate.set(value !== null ? toDecimal(value) : undefined)}
                    warning={showMagnitudeWarning(realDiscountRate)}
                    error={Model.realDiscountRate.useValidation}
                />
            </div>
        </div>
    );
}
