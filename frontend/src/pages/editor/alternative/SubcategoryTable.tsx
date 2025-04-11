import { mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import type { Cost, CostTypes, FuelType } from "blcc-format/Format";
import { useNavigate } from "react-router-dom";
import type { Subject } from "rxjs";
import { Defaults } from "blcc-format/Defaults";
import { CostModel } from "model/CostModel";

type CategoryTableProps = {
    name: string;
    costs: Cost[];
    sAddCostModal$: Subject<CostTypes | FuelType>;
};

export function SubcategoryTable({ name, costs, sAddCostModal$ }: CategoryTableProps) {
    const navigate = useNavigate();

    return (
        <span>
            <div className={"flex justify-between bg-primary px-2 py-1.5 text-center text-white"}>
                <div />
                <p>{name}</p>
                <div
                    onClick={() => sAddCostModal$.next(name as FuelType | CostTypes)}
                    onKeyUp={() => sAddCostModal$.next(name as FuelType | CostTypes)}
                >
                    <Icon
                        className={"cursor-pointer self-center rounded hover:bg-primary-light active:bg-primary-dark"}
                        path={mdiPlus}
                        size={1}
                    />
                </div>
            </div>
            <ul>
                {costs.length <= 0 && (
                    <li
                        className={
                            "cursor-default overflow-hidden text-ellipsis px-2 py-1.5 text-base-dark even:bg-base-lightest"
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
                                "flex flex-row justify-between overflow-hidden text-ellipsis even:bg-base-lightest hover:cursor-pointer"
                            }
                        >
                            <div
                                className={"flex-grow px-2 py-1.5 hover:text-primary "}
                                onClick={navigateToItem}
                                onKeyDown={navigateToItem}
                            >
                                {item?.name || "Unknown"}
                            </div>

                            <div
                                onClick={() => CostModel.Actions.deleteByID(item.id ?? Defaults.INVALID_ID)}
                                onKeyUp={() => CostModel.Actions.deleteByID(item.id ?? Defaults.INVALID_ID)}
                            >
                                <Icon
                                    className={
                                        "mx-2 my-1.5 cursor-pointer self-center rounded text-error hover:bg-error-lighter active:bg-error-light"
                                    }
                                    path={mdiMinus}
                                    size={1}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </span>
    );
}
