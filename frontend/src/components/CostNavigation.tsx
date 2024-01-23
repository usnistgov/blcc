import { mdiCurrencyUsd, mdiFileSign, mdiFormatListBulletedType, mdiLightningBolt, mdiWater } from "@mdi/js";
import React from "react";
import { useNavigate } from "react-router-dom";

import { Cost } from "../blcc-format/Format";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../util/Util";
import { altCosts$ } from "../pages/editor/Alternatives";
import { map } from "rxjs";
import button, { ButtonType } from "./Button";
import { useSubscribe } from "../hooks/UseSubscribe";
import collapse from "./Collapse";
import { bind } from "@react-rxjs/core";
import { arrayFilter } from "../util/Operators";

type MenuItem = {
    title: string;
    icon: string;
    predicate: (cost: Cost) => boolean;
};

const items: MenuItem[] = [
    {
        title: "Energy Costs",
        icon: mdiLightningBolt,
        predicate: isEnergyCost
    },
    {
        title: "Water Costs",
        icon: mdiWater,
        predicate: isWaterCost
    },
    {
        title: "Capital Costs",
        icon: mdiCurrencyUsd,
        predicate: isCapitalCost
    },
    {
        title: "Contract Costs",
        icon: mdiFileSign,
        predicate: isContractCost
    },
    {
        title: "Other Costs",
        icon: mdiFormatListBulletedType,
        predicate: isOtherCost
    }
];

function menuCollapse(item: MenuItem) {
    const { component: Collapse } = collapse();
    const [useButtons] = bind(
        altCosts$.pipe(
            arrayFilter(item.predicate),
            map((costs) =>
                costs.map((cost) => {
                    const button = costButton(cost);
                    return <button.component key={cost.id} />;
                })
            )
        ),
        []
    );

    return {
        component: function MenuCollapse() {
            return (
                <Collapse title={item.title} icon={item.icon}>
                    {useButtons()}
                </Collapse>
            );
        }
    };
}

function costButton(cost: Cost) {
    const { click$, component: Button } = button();

    return {
        component: function AltButton() {
            const navigate = useNavigate();
            useSubscribe(click$, () => navigate(`cost/${cost.id}`));
            return (
                <Button key={cost.id} type={ButtonType.PRIMARY}>
                    {cost.name}
                </Button>
            );
        }
    };
}

export default function CostNavigation() {
    return (
        <div className="flex h-full w-fit min-w-fit flex-col gap-2 overflow-y-auto whitespace-nowrap bg-primary p-2 text-base-lightest">
            {items.map((item) => {
                const { component: MenuCollapse } = menuCollapse(item);
                return <MenuCollapse key={item.title} />;
            })}
        </div>
    );
}
