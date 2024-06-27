import { bind } from "@react-rxjs/core";
import { Typography } from "antd";
import { CostTypes, DollarOrPercent, type ReplacementCapitalCost, type ResidualValue } from "blcc-format/Format";
import checkbox from "components/input/Checkbox";
import { NumberInput } from "components/input/InputNumber";
import type { Collection } from "dexie";
import { useDbUpdate } from "hooks/UseDbUpdate";
import { CostModel } from "model/CostModel";
import { useMemo } from "react";
import { type Observable, Subject, distinctUntilChanged, filter, merge } from "rxjs";
import { map } from "rxjs/operators";
import { defaultValue } from "util/Operators";

const { Title } = Typography;

// If we are on this page that means the cost collection can be narrowed to ReplacementCapitalCost.
const collection$ = CostModel.collection$ as Observable<Collection<ReplacementCapitalCost, number>>;
const replacementCapitalCost$ = CostModel.cost$.pipe(
    filter((cost): cost is ReplacementCapitalCost => cost.type === CostTypes.REPLACEMENT_CAPITAL),
);

const [useApproach, approach$] = bind(
    replacementCapitalCost$.pipe(map((cost) => cost.residualValue?.approach)),
    undefined,
);

const { component: ResidualValueCheckbox, onChange$: residualValueCheck$ } = checkbox(
    replacementCapitalCost$.pipe(map((cost) => cost.residualValue !== undefined)),
);
const residualValueEnabled$ = residualValueCheck$.pipe(
    map((value) => (value ? ({ approach: DollarOrPercent.DOLLAR, value: 0 } as ResidualValue) : undefined)),
);

export default function ReplacementCapitalCostFields() {
    const approach = useApproach();

    const [
        sInitialCost$,
        initialCost$,
        sAnnualRateOfChange$,
        annualRateOfChange$,
        sExpectedLife$,
        expectedLife$,
        sResidualValue$,
        residualValue$,
    ] = useMemo(() => {
        const sInitialCost$ = new Subject<number>();
        const initialCost$ = merge(sInitialCost$, replacementCapitalCost$.pipe(map((cost) => cost.initialCost))).pipe(
            distinctUntilChanged(),
        );

        const sAnnualRateOfChange$ = new Subject<number | undefined>();
        const annualRateOfChange$ = merge(
            sAnnualRateOfChange$,
            replacementCapitalCost$.pipe(map((cost) => cost.annualRateOfChange)),
        ).pipe(distinctUntilChanged());

        const sExpectedLife$ = new Subject<number | undefined>();
        const expectedLife$ = merge(
            sExpectedLife$,
            replacementCapitalCost$.pipe(map((cost) => cost.expectedLife)),
        ).pipe(distinctUntilChanged());

        const sResidualValue$ = new Subject<number | undefined>();
        const residualValue$ = merge(
            sResidualValue$,
            replacementCapitalCost$.pipe(map((cost) => cost.residualValue?.value)),
        ).pipe(distinctUntilChanged());

        return [
            sInitialCost$,
            initialCost$,
            sAnnualRateOfChange$,
            annualRateOfChange$,
            sExpectedLife$,
            expectedLife$,
            sResidualValue$,
            residualValue$,
        ];
    }, []);

    useDbUpdate(sInitialCost$.pipe(defaultValue(0)), collection$, "initialCost");
    useDbUpdate(sAnnualRateOfChange$, collection$, "annualRateOfChange");
    useDbUpdate(sExpectedLife$, collection$, "expectedLife");
    useDbUpdate(sResidualValue$, collection$, "residualValue.value");
    /*    useDbUpdate(
        dollarOrPercentChange$.pipe(map((value) => (value ? DollarOrPercent.PERCENT : DollarOrPercent.DOLLAR))),
        costCollection$,
        "residualValue.approach"
    );*/
    useDbUpdate(residualValueEnabled$, collection$, "residualValue");

    return (
        <div className={"max-w-screen-lg p-6"}>
            <div className={"grid grid-cols-3 gap-x-16 gap-y-4"}>
                <NumberInput
                    className={"w-full"}
                    addonBefore={"$"}
                    controls
                    label={"Initial Cost (Base Year Dollars)"}
                    value$={initialCost$}
                    wire={sInitialCost$}
                />
                <NumberInput
                    className={"w-full"}
                    addonAfter={"%"}
                    controls
                    allowEmpty
                    label={"Annual Rate of Change"}
                    value$={annualRateOfChange$}
                    wire={sAnnualRateOfChange$}
                />
                <NumberInput
                    className={"w-full"}
                    addonAfter={"years"}
                    controls
                    label={"Expected Lifetime"}
                    allowEmpty
                    value$={expectedLife$}
                    wire={sExpectedLife$}
                />
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
                            <NumberInput
                                className={"py-4"}
                                addonBefore={approach === DollarOrPercent.DOLLAR ? "$" : undefined}
                                addonAfter={approach === DollarOrPercent.PERCENT ? "%" : undefined}
                                label={"Residual Value"}
                                showLabel={false}
                                allowEmpty
                                value$={residualValue$}
                                wire={sResidualValue$}
                            />
                        </>
                    )}
                </span>
            </div>
        </div>
    );
}
