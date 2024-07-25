import { mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { bind } from "@react-rxjs/core";
import { Typography } from "antd";
import type { Alternative, Cost, CostTypes, FuelType, ID } from "blcc-format/Format";
import SubHeader from "components/SubHeader";
import { Button, ButtonType } from "components/input/Button";
import { TextArea } from "components/input/TextArea";
import TextInput, { TextInputType } from "components/input/TextInput";
import AddAlternativeModal from "components/modal/AddAlternativeModal";
import AddCostModal from "components/modal/AddCostModal";
import { motion } from "framer-motion";
import { useSubscribe } from "hooks/UseSubscribe";
import useParamSync from "hooks/useParamSync";
import { AlternativeModel } from "model/AlternativeModel";
import { currentProject$ } from "model/Model";
import { db } from "model/db";
import { useNavigate } from "react-router-dom";
import { Subject, combineLatest, sample, switchMap } from "rxjs";
import { map } from "rxjs/operators";
import { cloneName } from "util/Util";

const { Title } = Typography;

const cloneAlternativeClick$ = new Subject<void>();
const removeAlternativeClick$ = new Subject<void>();
const openAltModal$ = new Subject<void>();
const openCostModal$ = new Subject<void>();

/*const { onChange$: baseline$, component: BaselineSwitch } = switchComp(
    alternative$.pipe(map((alt) => alt?.baseline ?? false))
);*/

const removeAlternative$ = combineLatest([AlternativeModel.sID$, currentProject$]).pipe(
    sample(removeAlternativeClick$),
);
const cloneAlternative$ = combineLatest([AlternativeModel.alternative$, currentProject$]).pipe(
    sample(cloneAlternativeClick$),
);

type Subcategories<T> = {
    [key in keyof T]: Cost[];
};

// Count all energy costs, and the count of its subcategories
const [energyCategories] = bind(
    AlternativeModel.energyCosts$.pipe(
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ fuelType }) => fuelType) as Subcategories<FuelType>),
    ),
    {} as Subcategories<FuelType>,
);

// Count all water costs
const [waterCosts] = bind(
    AlternativeModel.waterCosts$.pipe(map((costs) => (costs.length > 0 ? { "Water Costs": costs } : {}))),
    {},
);

// Count all capital costs and its subcategories
const [capitalCategories] = bind(
    AlternativeModel.capitalCosts$.pipe(
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ type }) => type) as Subcategories<CostTypes>),
    ),
    {} as Subcategories<CostTypes>,
);

// Count all contract costs and its subcategories
const [contractCategories] = bind(
    AlternativeModel.contractCosts$.pipe(
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ type }) => type) as Subcategories<CostTypes>),
    ),
    {} as Subcategories<CostTypes>,
);

// Count all other costs and its subcategories
const [otherCategories] = bind(
    AlternativeModel.otherCosts$.pipe(
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ type }) => type) as Subcategories<CostTypes>),
    ),
    {} as Subcategories<CostTypes>,
);

function setBaseline([baseline, id]: [boolean, ID]) {
    db.transaction("rw", db.alternatives, async () => {
        db.alternatives.where("id").equals(id).modify({ baseline });

        // If we are setting the current alternatives baseline to true, set all other alternative baselines to false.
        if (baseline) db.alternatives.where("id").notEqual(id).modify({ baseline: false });
    });
}

function removeAlternative([alternativeID, projectID]: [number, number]) {
    return db.transaction("rw", db.alternatives, db.projects, async () => {
        // Remove alternative
        db.alternatives.where("id").equals(alternativeID).delete();

        // Remove alternative ID from project
        db.projects
            .where("id")
            .equals(projectID)
            .modify((project) => {
                const index = project.alternatives.indexOf(alternativeID);
                if (index > -1) {
                    project.alternatives.splice(index, 1);
                }
            });

        //TODO remove costs only associated with this alternative?
    });
}

async function cloneAlternative([alternative, projectID]: [Alternative, number]): Promise<ID> {
    // Clone copies everything besides the baseline value and the name is changed for differentiation
    const newAlternative = {
        ...alternative,
        id: undefined,
        baseline: false,
        name: cloneName(alternative.name),
    } as Alternative;

    return db.transaction("rw", db.alternatives, db.projects, async () => {
        // Add cloned alternative
        const newID = await db.alternatives.add(newAlternative);

        // Add copy to project
        db.projects
            .where("id")
            .equals(projectID)
            .modify((project) => {
                project.alternatives.push(newID);
            });

        return newID;
    });
}

export default function Alternatives() {
    // Navigate to general information page if there are no alternatives
    const navigate = useNavigate();
    useParamSync();

    //useSubscribe(baseline$.pipe(withLatestFrom(alternativeID$)), setBaseline);
    useSubscribe(removeAlternative$.pipe(switchMap(removeAlternative)), async () => {
        // Navigate to last alternative after deletion of current one
        const lastAlternative = await db.alternatives.reverse().first();
        if (lastAlternative !== undefined) navigate(`/editor/alternative/${lastAlternative.id}`);
        else navigate("/editor/alternative");
    });
    useSubscribe(cloneAlternative$.pipe(switchMap(cloneAlternative)), (id) => navigate(`/editor/alternative/${id}`));

    const categories = [
        {
            label: "Energy Costs",
            children: energyCategories(),
        },
        {
            label: "Water Costs",
            children: waterCosts(),
        },
        {
            label: "Capital Costs",
            children: capitalCategories(),
        },
        {
            label: "Contract Costs",
            children: contractCategories(),
        },
        {
            label: "Other Costs",
            children: otherCategories(),
        },
    ];

    return (
        <motion.div
            className="h-full w-full"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
        >
            <AddAlternativeModal open$={openAltModal$.pipe(map(() => true))} />
            <AddCostModal open$={openCostModal$.pipe(map(() => true))} />

            <SubHeader>
                <div className={"self-end"}>
                    <Button type={ButtonType.LINK} onClick={() => openAltModal$.next()}>
                        <Icon path={mdiPlus} size={1} />
                        Add Alternative
                    </Button>
                    <Button type={ButtonType.LINK} onClick={() => cloneAlternativeClick$.next()}>
                        <Icon path={mdiContentCopy} size={1} /> Clone
                    </Button>
                    <Button type={ButtonType.LINKERROR} onClick={() => removeAlternativeClick$.next()}>
                        <Icon path={mdiMinus} size={1} /> Remove
                    </Button>
                </div>
            </SubHeader>
            <div className={"p-6"}>
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
                            {/*<BaselineSwitch />*/}
                        </span>

                        <span className={"col-span-2"}>
                            <TextArea
                                className={"w-full"}
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
                    <Button type={ButtonType.LINK} onClick={() => openCostModal$.next()}>
                        <Icon path={mdiPlus} size={1} />
                        Add Cost
                    </Button>
                </div>
                <div className={"flex flex-wrap gap-16 py-6"}>
                    {categories.map((category) => {
                        const children: [string, Cost[]][] = Object.entries(category.children);

                        return (
                            <div className={"min-w-[20rem] max-w-xl"} key={category.label}>
                                <div className={"flex justify-between"}>
                                    <Title level={5}>{category.label}</Title>
                                </div>
                                {children.length > 0 ? (
                                    <div
                                        className={
                                            "flex flex-col overflow-hidden rounded-md border border-base-lightest shadow-md"
                                        }
                                    >
                                        {children.map(([name, costs]) => (
                                            <span key={name}>
                                                <div className={"bg-primary px-2 py-1.5 text-center text-white"}>
                                                    {name}
                                                </div>
                                                <ul className={"hover:cursor-pointer"}>
                                                    {costs.map((item: Cost) => {
                                                        const navigateToItem = () => navigate(`cost/${item.id}`);
                                                        return (
                                                            <li
                                                                key={item.id}
                                                                className={
                                                                    "overflow-hidden text-ellipsis px-2 py-1.5 even:bg-base-lightest hover:text-primary"
                                                                }
                                                                onClick={navigateToItem}
                                                                onKeyDown={navigateToItem}
                                                            >
                                                                {/*FIXME switch to button so keyboard navigation works*/}
                                                                {item?.name || "Unknown"}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={"text-base-dark"}>No {category.label}</p>
                                )}
                            </div>
                        );
                    })}
                    <div />
                </div>
            </div>
        </motion.div>
    );
}
