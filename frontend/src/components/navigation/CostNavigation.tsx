import { mdiCurrencyUsd, mdiFileSign, mdiFormatListBulletedType, mdiLightningBolt, mdiWater } from "@mdi/js";
import Icon from "@mdi/react";
import { type StateObservable, useStateObservable } from "@react-rxjs/core";
import type { Cost } from "blcc-format/Format";
import { Button, ButtonType } from "components/input/Button";
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
            )} text-left text-nowrap overflow-hidden text-ellipsis`}
            type={ButtonType.PRIMARY_DARK}
            onClick={() => {
                CostModel.sId$.next(costID ?? 0);

                if (!location.pathname.endsWith(`cost/${costID}`)) navigate(`cost/${costID}`);
            }}
        >
            {name}
        </Button>
    );
}

function CostButtons({ costs$, item }: { costs$: StateObservable<Cost[]>; item: MenuItem }) {
    const costs = useStateObservable(costs$);

    return (
        <>
            <span className={"flex flex-row place-items-center px-2 py-1 select-none"}>
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
        <nav className="flex h-full max-w-64 w-fit flex-col gap-2 overflow-y-auto bg-primary-dark p-2 text-base-lightest ">
            {items.map((item) => (
                <CostButtons key={item.title} item={item} costs$={item.costs$} />
            ))}
        </nav>
    );
}
