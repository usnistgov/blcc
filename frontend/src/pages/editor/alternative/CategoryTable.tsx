import type { Cost } from "blcc-format/Format";
import { useNavigate } from "react-router-dom";

type CategoryTableProps = {
    name: string;
    costs: Cost[];
};

export function CategoryTable({ name, costs }: CategoryTableProps) {
    const navigate = useNavigate();

    return (
        <span>
            <div className={"bg-primary px-2 py-1.5 text-center text-white"}>{name}</div>
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
    );
}
