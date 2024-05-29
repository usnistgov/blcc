import { bind } from "@react-rxjs/core";
import { Typography } from "antd";
import type { Collection } from "dexie";
import { type Observable, filter } from "rxjs";
import { map } from "rxjs/operators";
import {
    CostTypes,
    DollarOrPercent,
    type ReplacementCapitalCost,
    type ResidualValue,
} from "../../../blcc-format/Format";
import checkbox from "../../../components/Checkbox";
import numberInput from "../../../components/InputNumber";
import { useDbUpdate } from "../../../hooks/UseDbUpdate";
import { CostModel } from "../../../model/CostModel";
import { defaultValue } from "../../../util/Operators";

const { Title } = Typography;

// If we are on this page that means the cost collection can be narrowed to ReplacementCapitalCost.
const costCollection$ = CostModel.collection$ as Observable<Collection<ReplacementCapitalCost, number>>;
const replacementCapitalCost$ = CostModel.cost$.pipe(
    filter((cost): cost is ReplacementCapitalCost => cost.type === CostTypes.REPLACEMENT_CAPITAL),
);

const [useApproach, approach$] = bind(
    replacementCapitalCost$.pipe(map((cost) => cost.residualValue?.approach)),
    undefined,
);

const { component: InitialCostInput, onChange$: initialCost$ } = numberInput(
    "Inital Cost (Base Year Dollars)",
    "/",
    replacementCapitalCost$.pipe(map((cost) => cost.initialCost)),
);
const { component: AnnualRateOfChangeInput, onChange$: annualRateOfChange$ } = numberInput(
    "Annual Rate of Change",
    "/",
    replacementCapitalCost$.pipe(map((cost) => cost.annualRateOfChange)),
    true,
);
const { component: ExpectedLifeInput, onChange$: expectedLife$ } = numberInput(
    "Expected Lifetime",
    "/",
    replacementCapitalCost$.pipe(map((cost) => cost.expectedLife)),
    true,
);
/*const { component: ResidualValueSwitch, onChange$: dollarOrPercentChange$ } = switchComp(
    approach$.pipe(map((approach) => approach === DollarOrPercent.PERCENT))
);*/
const { component: ResidualValueInput, onChange$: residualValue$ } = numberInput(
    "Residual Value",
    "/",
    replacementCapitalCost$.pipe(map((cost) => cost.residualValue?.value)),
    true,
);

const { component: ResidualValueCheckbox, onChange$: residualValueCheck$ } = checkbox(
    replacementCapitalCost$.pipe(map((cost) => cost.residualValue !== undefined)),
);
const residualValueEnabled$ = residualValueCheck$.pipe(
    map((value) => (value ? ({ approach: DollarOrPercent.DOLLAR, value: 0 } as ResidualValue) : undefined)),
);

export default function ReplacementCapitalCostFields() {
    const approach = useApproach();

    useDbUpdate(initialCost$.pipe(defaultValue(0)), costCollection$, "initialCost");
    useDbUpdate(annualRateOfChange$, costCollection$, "annualRateOfChange");
    useDbUpdate(expectedLife$, costCollection$, "expectedLife");
    useDbUpdate(residualValue$, costCollection$, "residualValue.value");
    /*    useDbUpdate(
        dollarOrPercentChange$.pipe(map((value) => (value ? DollarOrPercent.PERCENT : DollarOrPercent.DOLLAR))),
        costCollection$,
        "residualValue.approach"
    );*/
    useDbUpdate(residualValueEnabled$, costCollection$, "residualValue");

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <InitialCostInput className={"w-full"} addonBefore={"$"} controls />
                <AnnualRateOfChangeInput className={"w-full"} addonAfter={"%"} controls />
                <ExpectedLifeInput className={"w-full"} addonAfter={"years"} controls />
                <span className={"flex flex-col"}>
                    <div className={"flex flex-row gap-2"}>
                        <ResidualValueCheckbox className={""} />
                        <Title level={5} className={"mt-2"}>
                            Residual Value
                        </Title>
                    </div>

                    {approach !== undefined && (
                        <>
                            <span>
                                {/*<ResidualValueSwitch unCheckedChildren={"Dollar"} checkedChildren={"Percent"} />*/}
                            </span>
                            <ResidualValueInput
                                className={"py-4"}
                                label={false}
                                addonBefore={approach === DollarOrPercent.DOLLAR ? "$" : undefined}
                                addonAfter={approach === DollarOrPercent.PERCENT ? "%" : undefined}
                            />
                        </>
                    )}
                </span>
            </div>
        </div>
    );
}
