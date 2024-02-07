import { Alternative, Cost, CostTypes, FuelType, ID } from "../../blcc-format/Format";
import { Typography } from "antd";
import button, { ButtonType } from "../../components/Button";
import { mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import addAlternativeModal from "../../components/AddAlternativeModal";
import addCostModal from "../../components/AddCostModal";
import switchComp from "../../components/Switch";
import textArea from "../../components/TextArea";
import textInput, { TextInputType } from "../../components/TextInput";
import { useNavigate } from "react-router-dom";
import { map, withLatestFrom } from "rxjs/operators";
import { combineLatest, sample, switchMap } from "rxjs";
import { bind } from "@react-rxjs/core";
import {
    alternative$,
    alternativeCollection$,
    alternativeID$,
    capitalCosts$,
    contractCosts$,
    energyCosts$,
    otherCosts$,
    waterCosts$
} from "../../model/AlternativeModel";
import { currentProject$, useAlternativeIDs } from "../../model/Model";
import { useEffect } from "react";
import { useDbUpdate } from "../../hooks/UseDbUpdate";
import { defaultValue } from "../../util/Operators";
import { db } from "../../model/db";
import { useSubscribe } from "../../hooks/UseSubscribe";

const { Title } = Typography;

const { click$: cloneAlternativeClick$, component: CloneButton } = button();
const { click$: removeAlternativeClick$, component: RemoveButton } = button();
const { click$: openAltModal$, component: AddAlternativeButton } = button();
const { click$: openCostModal$, component: AddCostButton } = button();
const { onChange$: baseline$, component: BaselineSwitch } = switchComp(
    alternative$.pipe(map((alt) => alt?.baseline ?? false))
);
const { onChange$: name$, component: NameInput } = textInput(alternative$.pipe(map((alt) => alt.name)));
const { onChange$: description$, component: DescInput } = textArea(alternative$.pipe(map((alt) => alt.description)));

const removeAlternative$ = combineLatest([alternativeID$, currentProject$]).pipe(sample(removeAlternativeClick$));
const cloneAlternative$ = combineLatest([alternative$, currentProject$]).pipe(sample(cloneAlternativeClick$));

const { component: AddAlternativeModal } = addAlternativeModal(openAltModal$.pipe(map(() => true)));
const { component: AddCostModal } = addCostModal(openCostModal$.pipe(map(() => true)));

type Subcategories<T> = {
    [key in keyof T]: Cost[];
};

// Count all energy costs, and the count of its subcategories
const [energyCategories] = bind(
    energyCosts$.pipe(
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ fuelType }) => fuelType) as Subcategories<FuelType>)
    ),
    {} as Subcategories<FuelType>
);

// Count all water costs
const [waterCosts] = bind(waterCosts$, []);

// Count all capital costs and its subcategories
const [capitalCategories] = bind(
    capitalCosts$.pipe(
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ type }) => type) as Subcategories<CostTypes>)
    ),
    {} as Subcategories<CostTypes>
);

// Count all contract costs and its subcategories
const [contractCategories] = bind(
    contractCosts$.pipe(
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ type }) => type) as Subcategories<CostTypes>)
    ),
    {} as Subcategories<CostTypes>
);

// Count all other costs and its subcategories
const [otherCategories] = bind(
    otherCosts$.pipe(
        // @ts-expect-error groupBy is linted by mistake
        map((costs) => Object.groupBy(costs, ({ type }) => type) as Subcategories<CostTypes>)
    ),
    {} as Subcategories<CostTypes>
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
        name: `${alternative.name} Copy`
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
    const alternatives = useAlternativeIDs();
    useEffect(() => {
        if (alternatives.length <= 0) navigate("/editor");
    }, []);

    useDbUpdate(name$.pipe(defaultValue("Unnamed Alternative")), alternativeCollection$, "name");
    useDbUpdate(description$.pipe(defaultValue(undefined)), alternativeCollection$, "description");
    useSubscribe(baseline$.pipe(withLatestFrom(alternativeID$)), setBaseline);
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
            children: energyCategories()
        },
        {
            label: "Water Costs",
            children: waterCosts()
        },
        {
            label: "Capital Costs",
            children: capitalCategories()
        },
        {
            label: "Contract Costs",
            children: contractCategories()
        },
        {
            label: "Other Costs",
            children: otherCategories()
        }
    ];

    return (
        <div className="h-full w-full">
            <AddAlternativeModal />
            <AddCostModal />

            <div className={"flex-end flex justify-end border-b-2 border-base-lightest py-2"}>
                <AddAlternativeButton type={ButtonType.LINK}>
                    <Icon path={mdiPlus} size={1} />
                    Add Alternative
                </AddAlternativeButton>
                <CloneButton type={ButtonType.LINK}>
                    <Icon path={mdiContentCopy} size={1} /> Clone
                </CloneButton>
                <RemoveButton type={ButtonType.LINKERROR}>
                    <Icon path={mdiMinus} size={1} /> Remove
                </RemoveButton>
            </div>
            <div className={"p-6"}>
                <div className={"max-w-screen-lg"}>
                    <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                        <NameInput className={"w-full"} type={TextInputType.PRIMARY} label={"Name"} />
                        <span className={"w-1/2"}>
                            <Title level={5}>Baseline Alternative</Title>
                            <p>Only one alternative can be the baseline.</p>
                            <BaselineSwitch />
                        </span>

                        <span className={"col-span-2"}>
                            <DescInput className={"w-full"} label={"Description"} />
                        </span>
                    </div>
                </div>

                <br />
                <div className={"flex justify-between border-b-2 border-base-lightest"}>
                    <Title level={4}>Alternative Costs</Title>
                    <AddCostButton type={ButtonType.LINK}>
                        <Icon path={mdiPlus} size={1} />
                        Add Cost
                    </AddCostButton>
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
                                                    {costs.map((item: Cost) => (
                                                        <li
                                                            key={item.id}
                                                            className={
                                                                "overflow-hidden text-ellipsis px-2 py-1.5 even:bg-base-lightest hover:text-primary"
                                                            }
                                                            onClick={() => navigate(`cost/${item.id}`)}
                                                        >
                                                            {/*FIXME switch to button so keyboard navigation works*/}
                                                            {item?.name || "Unknown"}
                                                        </li>
                                                    ))}
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
        </div>
    );
}
