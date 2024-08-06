import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import Title from "antd/es/typography/Title";
import { type Cost, CostTypes, type EnergyCost, FuelType, WaterCost } from "blcc-format/Format";
import { Button, ButtonType } from "components/input/Button";
import Switch from "components/input/Switch";
import { TextArea } from "components/input/TextArea";
import TextInput, { TextInputType } from "components/input/TextInput";
import AddCostModal from "components/modal/AddCostModal";
import { motion } from "framer-motion";
import { useSubscribe } from "hooks/UseSubscribe";
import useParamSync from "hooks/useParamSync";
import { AlternativeModel } from "model/AlternativeModel";
import AlternativeSubHeader from "pages/editor/alternative/AlternativeSubHeader";
import CategoryTable, { type Subcategories } from "pages/editor/alternative/CategoryTable";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
    map((costs) => group(costs, Object.values(FuelType), (cost) => (cost as EnergyCost).fuelType)),
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
    const navigate = useNavigate();
    useParamSync();

    // Set up streams
    const [confirmBaselineChange$, sBaselineChange$, baselineChangeNoConfirm$, openCostModal$] = useMemo(() => {
        const openCostModal$ = new Subject<CostTypes>();

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
            label: "Energy Costs",
            children: energyCategories$,
        },
        {
            label: "Water Costs",
            children: waterCosts$,
        },
        {
            label: "Capital Costs",
            children: capitalCategories$,
        },
        {
            label: "Contract Costs",
            children: contractCategories$,
        },
        {
            label: "Other Costs",
            children: otherCategories$,
        },
    ];

    return (
        <motion.div
            className="h-full w-full flex flex-col"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
        >
            <AddCostModal open$={openCostModal$} />

            <AlternativeSubHeader />

            <div className={"flex flex-col p-6 h-full overflow-y-auto"}>
                <div className={"max-w-screen-lg"}>
                    <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                        <TextInput
                            className={"w-full"}
                            type={TextInputType.PRIMARY}
                            label={"Name"}
                            value$={AlternativeModel.name$}
                            wire={AlternativeModel.sName$}
                        />
                        <span className={"w-1/2"}>
                            <Title level={5}>Baseline Alternative</Title>
                            <p>Only one alternative can be the baseline.</p>
                            <Switch value$={AlternativeModel.isBaseline$} wire={sBaselineChange$} />
                        </span>

                        <span className={"col-span-2"}>
                            <TextArea
                                className={"w-full max-h-36"}
                                label={"Description"}
                                value$={AlternativeModel.description$}
                                wire={AlternativeModel.sDescription$}
                            />
                        </span>
                    </div>
                </div>

                <br />
                <div className={"flex justify-between border-b-2 border-base-lightest"}>
                    <Title level={4}>Alternative Costs</Title>
                    <Button type={ButtonType.LINK} onClick={() => openCostModal$.next(CostTypes.CAPITAL)}>
                        <Icon path={mdiPlus} size={1} />
                        Add Cost
                    </Button>
                </div>
                <div className={"flex flex-wrap gap-16 py-6 mb-32"}>
                    {categories.map((category) => (
                        <CategoryTable
                            key={category.label}
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
