import { mdiCurrencyUsd, mdiFileSign, mdiFormatListBulletedType, mdiLightningBolt, mdiWater } from "@mdi/js";
import { useNavigate } from "react-router-dom";

import { Cost } from "../../blcc-format/Format";
import { map, Observable } from "rxjs";
import button, { ButtonType } from "./../Button";
import { useSubscribe } from "../../hooks/UseSubscribe";
import collapse from "./../Collapse";
import { bind } from "@react-rxjs/core";
import { capitalCosts$, contractCosts$, energyCosts$, otherCosts$, waterCosts$ } from "../../model/AlternativeModel";
import { useActiveLink } from "../../hooks/UseActiveLink";

type MenuItem = {
    title: string;
    icon: string;
    costs$: Observable<Cost[]>;
};

const items: MenuItem[] = [
    {
        title: "Energy Costs",
        icon: mdiLightningBolt,
        costs$: energyCosts$
    },
    {
        title: "Water Costs",
        icon: mdiWater,
        costs$: waterCosts$
    },
    {
        title: "Capital Costs",
        icon: mdiCurrencyUsd,
        costs$: capitalCosts$
    },
    {
        title: "Contract Costs",
        icon: mdiFileSign,
        costs$: contractCosts$
    },
    {
        title: "Other",
        icon: mdiFormatListBulletedType,
        costs$: otherCosts$
    }
];

function menuCollapse(item: MenuItem) {
    const { component: Collapse } = collapse();
    const [useButtons] = bind(
        item.costs$.pipe(
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
                <Collapse buttonType={ButtonType.PRIMARY_DARK} title={item.title} icon={item.icon}>
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
            useSubscribe(click$, () => navigate(`cost/${cost.id}`), [navigate]);
            return (
                <Button
                    key={cost.id}
                    className={useActiveLink(`/editor/alternative/:alternativeID/cost/${cost.id}`)}
                    type={ButtonType.PRIMARY_DARK}
                >
                    {cost.name}
                </Button>
            );
        }
    };
}

export default function CostNavigation() {
    return (
        <div className="flex h-full w-fit min-w-fit flex-col gap-2 overflow-y-auto whitespace-nowrap bg-primary-dark p-2 text-base-lightest">
            {items.map((item) => {
                const { component: MenuCollapse } = menuCollapse(item);
                return <MenuCollapse key={item.title} />;
            })}
        </div>
    );
}
