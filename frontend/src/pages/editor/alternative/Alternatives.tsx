import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import Title from "antd/es/typography/Title";
import { AnalysisType, type Cost, CostTypes, type EnergyCost, type ERCIPCost, FuelType } from "blcc-format/Format";
import Info from "components/Info";
import { Button, ButtonType } from "components/input/Button";
import Switch from "components/input/Switch";
import { TestNumberInput } from "components/input/TestNumberInput";
import { TextArea } from "components/input/TextArea";
import TextInput, { TextInputType } from "components/input/TextInput";
import AddCostModal from "components/modal/AddCostModal";
import { Strings } from "constants/Strings";
import { motion } from "framer-motion";
import { useSubscribe } from "hooks/UseSubscribe";
import useParamSync from "hooks/useParamSync";
import { AlternativeModel } from "model/AlternativeModel";
import { CostModel } from "model/CostModel";
import { Model } from "model/Model";
import AlternativeSubHeader from "pages/editor/alternative/AlternativeSubHeader";
import CategoryTable, { type Subcategories } from "pages/editor/alternative/CategoryTable";
import { useMemo } from "react";
import { Subject, merge } from "rxjs";
import { filter, map, tap, withLatestFrom } from "rxjs/operators";
import { confirm } from "util/Operators";
import { bind } from "@react-rxjs/core";
import { db } from "model/db";
import { Divider } from "antd";
import { NistFooter } from "components/NistHeaderFooter";

const [useERCIPCost] = bind(AlternativeModel.ercipCost$.pipe(map((costs) => costs[0] as ERCIPCost)));

function group<T extends string>(costs: Cost[], keys: T[], extractor: (cost: Cost) => T): Subcategories<T> {
    const result = {};

    for (const key of keys) {
        // @ts-ignore
        result[key] = [];
    }

    for (const cost of costs) {
        // @ts-ignore
        result[extractor(cost)].push(cost);
    }

    return result as Subcategories<T>;
}

// Count all energy costs, and the count of its subcategories
const energyCategories$ = AlternativeModel.energyCosts$.pipe(
    map((costs) => group(costs, Object.values(FuelType), (cost) => (cost as EnergyCost).fuelType ?? FuelType.OTHER)),
);

// Count all water costs
const waterCosts$ = AlternativeModel.waterCosts$.pipe(
    map((costs) => ({ [CostTypes.WATER]: costs }) as unknown as Subcategories<CostTypes>),
);

// Count all capital costs and its subcategories
const capitalCategories$ = AlternativeModel.capitalCosts$.pipe(
    map((costs) =>
        group(costs, [CostTypes.CAPITAL, CostTypes.REPLACEMENT_CAPITAL, CostTypes.OMR], (cost) => cost.type),
    ),
);

// Count all contract costs and its subcategories
const contractCategories$ = AlternativeModel.contractCosts$.pipe(
    map((costs) =>
        group(costs, [CostTypes.IMPLEMENTATION_CONTRACT, CostTypes.RECURRING_CONTRACT], (cost) => cost.type),
    ),
);

// Count all other costs and its subcategories
const otherCategories$ = AlternativeModel.otherCosts$.pipe(
    map((costs) => group(costs, [CostTypes.OTHER, CostTypes.OTHER_NON_MONETARY], (cost) => cost.type)),
);

function ERCIPFields() {
    const ercipCost = useERCIPCost();
    const inputClasses = "w-full mb-4 flex-1";

    return (
        <div className="flex flex-col flex-1">
            <Title className="self-center" level={3}>
                <Info text={Strings.ERCIP_INVESTMENT}>Investment</Info>
            </Title>
            <Divider className="mt-1" />
            <div className="flex-1 justify-center pl-10 2xl:flex 2xl:flex-row">
                <div className="justify-between gap-y-4 2xl:flex 2xl:w-full 2xl:flex-col">
                    <TestNumberInput
                        className={inputClasses}
                        addonBefore={"$"}
                        controls
                        label={"A - Construction Cost*"}
                        getter={() => ercipCost?.constructionCost}
                        onChange={(value) => db.costs.put({ ...ercipCost, constructionCost: value ?? 0 }, ercipCost.id)}
                    />
                    <TestNumberInput
                        className={inputClasses}
                        addonBefore={"$"}
                        controls
                        label={"B - SIOH*"}
                        getter={() => ercipCost?.SIOH}
                        onChange={(value) => db.costs.put({ ...ercipCost, SIOH: value ?? 0 }, ercipCost.id)}
                    />
                    <TestNumberInput
                        className={inputClasses}
                        addonBefore={"$"}
                        controls
                        label={"C - Design Cost*"}
                        getter={() => ercipCost?.designCost}
                        onChange={(value) => db.costs.put({ ...ercipCost, designCost: value ?? 0 }, ercipCost.id)}
                    />
                    <TestNumberInput
                        className={`${inputClasses} !text-black`}
                        addonBefore={"$"}
                        controls
                        label={"D - Total Cost (A + B + C)"}
                        getter={() => ercipCost?.constructionCost + ercipCost?.SIOH + ercipCost?.designCost}
                        readOnly
                    />
                </div>
                <div className="2xl:mx-16 2xl:border-l" />
                <Divider className="sm:2xl:hidden" />
                <div className="justify-between gap-y-4 2xl:flex 2xl:w-full 2xl:flex-col">
                    <TestNumberInput
                        className={inputClasses}
                        addonBefore={"$"}
                        controls
                        label={"E - Salvage Value of Existing Equipment*"}
                        getter={() => ercipCost?.salvageValue}
                        onChange={(value) => db.costs.put({ ...ercipCost, salvageValue: value ?? 0 }, ercipCost.id)}
                    />
                    <TestNumberInput
                        className={inputClasses}
                        addonBefore={"$"}
                        controls
                        label={"R - Public Utility Company Rebate*"}
                        getter={() => ercipCost?.publicUtilityRebate}
                        onChange={(value) =>
                            db.costs.put({ ...ercipCost, publicUtilityRebate: value ?? 0 }, ercipCost.id)
                        }
                    />
                    <TestNumberInput
                        className={inputClasses}
                        addonBefore={"$"}
                        controls
                        label={"G - Cybersecurity (Assess and Authorize)*"}
                        getter={() => ercipCost?.cybersecurity}
                        onChange={(value) => db.costs.put({ ...ercipCost, cybersecurity: value ?? 0 }, ercipCost.id)}
                    />
                    <TestNumberInput
                        className={inputClasses}
                        addonBefore={"$"}
                        controls
                        label={"Total Investment (D - E - F - G)"}
                        getter={() =>
                            ercipCost?.constructionCost +
                            ercipCost?.SIOH +
                            ercipCost?.designCost -
                            (ercipCost?.salvageValue + ercipCost?.publicUtilityRebate + ercipCost?.cybersecurity)
                        }
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
}

export default function Alternatives() {
    useParamSync();
    const analysisType = Model.analysisType.use();

    // Set up streams
    const [confirmBaselineChange$, sBaselineChange$, baselineChangeNoConfirm$, openCostModal$] = useMemo(() => {
        const openCostModal$ = new Subject<CostTypes | FuelType>();

        // Stream of baseline switch change events.
        const sBaselineChange$ = new Subject<boolean>();

        // If we are changing the baseline to true, and we already have a baseline, show the confirmation modal.
        const confirmBaselineChange$ = sBaselineChange$.pipe(
            withLatestFrom(AlternativeModel.hasBaseline$),
            filter(([value, hasBaseline]) => value && hasBaseline),
            map(() => true),
            confirm(
                "Change Baseline?",
                "Only one alternative can be the baseline. Changing this will disable the current baseline.",
            ),
        );

        // If we are disabling a baseline allow this without showing the modal.
        const disableBaseline$ = sBaselineChange$.pipe(filter((value) => !value));
        //If we are enabling a baseline when one does not already exist, allow this without showing the modal
        const enableBaselineWithoutModal$ = sBaselineChange$.pipe(
            withLatestFrom(AlternativeModel.hasBaseline$),
            filter(([value, hasBaseline]) => value && !hasBaseline),
            map(() => true),
        );

        const baselineChangeNoConfirm$ = merge(disableBaseline$, enableBaselineWithoutModal$);

        return [confirmBaselineChange$, sBaselineChange$, baselineChangeNoConfirm$, openCostModal$];
    }, []);

    // Listen for regular baseline change or baseline change confirmation
    useSubscribe(merge(confirmBaselineChange$, baselineChangeNoConfirm$), AlternativeModel.sBaseline$);
    useSubscribe(CostModel.Actions.removeCost$);

    const categories = [
        {
            info: Strings.ENERGY_COSTS,
            label: "Energy Costs",
            children: energyCategories$,
        },
        {
            info: Strings.WATER_COST,
            label: "Water Costs",
            children: waterCosts$,
        },
        {
            info: Strings.CAPITAL_COSTS,
            label: "Capital Component Costs",
            children: capitalCategories$,
        },
        {
            info: Strings.CONTRACT_COSTS,
            label: "Contract Costs",
            children: contractCategories$,
        },
        {
            info: Strings.OTHER_COSTS,
            label: "Other Costs",
            children: otherCategories$,
        },
    ];

    return (
        <motion.div
            className="flex h-full w-full flex-col"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
        >
            <AddCostModal open$={openCostModal$} />

            <AlternativeSubHeader />

            <div className={"flex h-full flex-col overflow-y-auto pt-6 px-6"}>
                <div className={analysisType === AnalysisType.MILCON_ECIP ? "flex flex-row" : ""}>
                    <div
                        className={`grid grid-cols-2 gap-x-16 gap-y-4 ${analysisType === AnalysisType.MILCON_ECIP ? "flex-1" : "w-1/2"}`}
                    >
                        <TextInput
                            className={"w-full"}
                            type={TextInputType.PRIMARY}
                            label={"Name"}
                            value$={AlternativeModel.name$}
                            wire={AlternativeModel.sName$}
                            showCount
                            maxLength={45}
                        />
                        <span className={"2xl:w-1/2 w-full"}>
                            <Title level={5}>
                                <Info text={Strings.BASELINE_ALTERNATIVE}>Baseline Alternative</Info>
                            </Title>
                            <p>Only one alternative can be the baseline.</p>
                            <Switch
                                value$={AlternativeModel.isBaseline$}
                                wire={sBaselineChange$}
                                disabled={analysisType === AnalysisType.MILCON_ECIP}
                            />
                        </span>

                        <span className={"col-span-2"}>
                            <TextArea
                                className={"mb-3 max-h-36 w-full"}
                                label={"Description"}
                                value$={AlternativeModel.description$}
                                wire={AlternativeModel.sDescription$}
                                showCount
                                maxLength={300}
                            />
                        </span>
                    </div>
                    {analysisType === AnalysisType.MILCON_ECIP && <ERCIPFields />}
                </div>

                <br />
                <div className={"flex justify-between border-base-lightest border-b-2"}>
                    <Title level={4}>
                        <Info text={Strings.ALTERNATIVE_COSTS}>Alternative Costs</Info>
                    </Title>
                    <Button type={ButtonType.LINK} onClick={() => openCostModal$.next(CostTypes.CAPITAL)}>
                        <Icon path={mdiPlus} size={1} />
                        Add Cost
                    </Button>
                </div>
                <div className={"flex flex-wrap gap-16 py-6"}>
                    {categories.map((category) => (
                        <CategoryTable
                            key={category.label}
                            info={category.info}
                            name={category.label}
                            category$={category.children}
                            sAddCostModal$={openCostModal$}
                        />
                    ))}
                    <div />
                </div>

                <div className={"grow"}/>
                <NistFooter rounded={false} />
            </div>
        </motion.div>
    );
}
