import { mdiCurrencyUsd, mdiFileSign, mdiFormatListBulletedType, mdiLightningBolt, mdiWater } from "@mdi/js";
import Icon from "@mdi/react";
import { type StateObservable, useStateObservable } from "@react-rxjs/core";
import type { Cost } from "blcc-format/Format";
import { Button, ButtonType } from "components/input/Button";
import { motion } from "framer-motion";
import { useActiveLink } from "hooks/UseActiveLink";
import { AlternativeModel } from "model/AlternativeModel";
import { CostModel } from "model/CostModel";
import { useLocation, useNavigate } from "react-router-dom";

type MenuItem = {
    title: string;
    icon: string;
    costs$: StateObservable<Cost[]>;
};

const items: MenuItem[] = [
    {
        title: "Energy Costs",
        icon: mdiLightningBolt,
        costs$: AlternativeModel.energyCosts$,
    },
    {
        title: "Water Costs",
        icon: mdiWater,
        costs$: AlternativeModel.waterCosts$,
    },
    {
        title: "Capital Costs",
        icon: mdiCurrencyUsd,
        costs$: AlternativeModel.capitalCosts$,
    },
    {
        title: "Contract Costs",
        icon: mdiFileSign,
        costs$: AlternativeModel.contractCosts$,
    },
    {
        title: "Other",
        icon: mdiFormatListBulletedType,
        costs$: AlternativeModel.otherCosts$,
    },
];

function CostButton({ costID, name }: { costID: number; name: string }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Button
            key={costID}
            className={`${useActiveLink(
                `/editor/alternative/:alternativeID/cost/${costID}`,
            )} overflow-hidden text-ellipsis text-nowrap text-left`}
            type={ButtonType.PRIMARY_DARK}
            onClick={() => {
                CostModel.Actions.load(costID ?? 0);

                if (!location.pathname.endsWith(`cost/${costID}`)) navigate(`cost/${costID}`);
            }}
        >
            <p className={"w-full overflow-hidden text-ellipsis"}>{name}</p>
        </Button>
    );
}

function CostButtons({ costs$, item }: { costs$: StateObservable<Cost[]>; item: MenuItem }) {
    const costs = useStateObservable(costs$);

    return (
        <>
            <span className={"flex select-none flex-row place-items-center px-2 py-1"}>
                <Icon className={"mr-1 min-w-[24px]"} path={item.icon} size={0.8} />
                {item.title}
            </span>
            <div className={"flex flex-col gap-2 pl-8"}>
                {costs.map((cost) => (
                    <CostButton key={cost.id} costID={cost.id ?? 0} name={cost.name} />
                ))}
            </div>
        </>
    );
}

export default function CostNavigation() {
    return (
        <motion.div
            exit={{ translateX: "-100%" }}
            initial={{ translateX: "-100%" }}
            animate={{ translateX: 0 }}
            transition={{ duration: 0.08 }}
        >
            <nav className="flex h-full w-fit min-w-48 max-w-64 flex-col gap-2 overflow-y-auto bg-primary-dark p-2 text-base-lightest ">
                {items.map((item) => (
                    <CostButtons key={item.title} item={item} costs$={item.costs$} />
                ))}
            </nav>
        </motion.div>
    );
}
