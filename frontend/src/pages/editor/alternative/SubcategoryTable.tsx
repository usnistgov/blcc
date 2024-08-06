import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { type Cost, CostTypes, FuelType } from "blcc-format/Format";
import { useNavigate } from "react-router-dom";
import type { Subject } from "rxjs";

type CategoryTableProps = {
    name: string;
    costs: Cost[];
    sAddCostModal$: Subject<CostTypes>;
};

function getCostType(name: string) {
    if (Object.values(FuelType).includes(name as FuelType)) return CostTypes.ENERGY;

    return name as CostTypes;
}

export function SubcategoryTable({ name, costs, sAddCostModal$ }: CategoryTableProps) {
    const navigate = useNavigate();

    return (
        <span>
            <div className={"bg-primary px-2 py-1.5 text-center text-white flex justify-between"}>
                <div />
                <p>{name}</p>
                <div onClick={() => sAddCostModal$.next(getCostType(name))}>
                    <Icon
                        className={"self-center hover:bg-primary-light active:bg-primary-dark cursor-pointer rounded"}
                        path={mdiPlus}
                        size={1}
                    />
                </div>
            </div>
            <ul>
                {costs.length <= 0 && (
                    <li
                        className={
                            "text-base-dark overflow-hidden text-ellipsis px-2 py-1.5 cursor-default even:bg-base-lightest"
                        }
                    >
                        None
                    </li>
                )}
                {costs.map((item: Cost) => {
                    const navigateToItem = () => navigate(`cost/${item.id}`);
                    return (
                        <li
                            key={item.id}
                            className={
                                "overflow-hidden text-ellipsis px-2 py-1.5 even:bg-base-lightest hover:text-primary hover:cursor-pointer"
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
    );
}
