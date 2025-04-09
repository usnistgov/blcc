import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import Title from "antd/es/typography/Title";
import { type Cost, CostTypes, type EnergyCost, FuelType } from "blcc-format/Format";
import Info from "components/Info";
import { Button, ButtonType } from "components/input/Button";
import Switch from "components/input/Switch";
import { TextArea } from "components/input/TextArea";
import TextInput, { TextInputType } from "components/input/TextInput";
import AddCostModal from "components/modal/AddCostModal";
import { Strings } from "constants/Strings";
import { motion } from "framer-motion";
import { useSubscribe } from "hooks/UseSubscribe";
import useParamSync from "hooks/useParamSync";
import { AlternativeModel } from "model/AlternativeModel";
import AlternativeSubHeader from "pages/editor/alternative/AlternativeSubHeader";
import CategoryTable, { type Subcategories } from "pages/editor/alternative/CategoryTable";
import { useMemo } from "react";
import { Subject, merge } from "rxjs";
import { filter, map, withLatestFrom } from "rxjs/operators";
import { confirm } from "util/Operators";

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

export default function Alternatives() {
    useParamSync();

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

            <div className={"flex h-full flex-col overflow-y-auto p-6"}>
                <div className={"max-w-screen-lg"}>
                    <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                        <TextInput
                            className={"w-full"}
                            type={TextInputType.PRIMARY}
                            label={"Name"}
                            value$={AlternativeModel.name$}
                            wire={AlternativeModel.sName$}
                            showCount
                            maxLength={45}
                        />
                        <span className={"w-1/2"}>
                            <Title level={5}>
                                <Info text={Strings.BASELINE_ALTERNATIVE}>Baseline Alternative</Info>
                            </Title>
                            <p>Only one alternative can be the baseline.</p>
                            <Switch value$={AlternativeModel.isBaseline$} wire={sBaselineChange$} />
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
                <div className={"mb-32 flex flex-wrap gap-16 py-6"}>
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
            </div>
        </motion.div>
    );
}
