import { mdiCurrencyUsd, mdiFileSign, mdiFormatListBulletedType, mdiLightningBolt, mdiWater } from "@mdi/js";
import React from "react";
import { useNavigate } from "react-router-dom";

import { Cost } from "../blcc-format/Format";
import { Model } from "../model/Model";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../util/Util";
import { altCosts$ } from "../pages/editor/Alternatives";
import { map } from "rxjs";
import button, { ButtonType } from "./Button";
import { useSubscribe } from "../hooks/UseSubscribe";
import collapse from "./Collapse";
import { bind } from "@react-rxjs/core";

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

const [useEnergyButtons] = bind(
    altCosts$.pipe(
        map((costs) =>
            costs.map((cost) => {
                const button = costButton(cost);
                return <button.component key={cost.id} />;
            })
        )
    ),
    []
);
const [useWateryButtons] = bind(
    altCosts$.pipe(
        map((costs) =>
            costs.map((cost) => {
                const button = costButton(cost);
                return <button.component key={cost.id} />;
            })
        )
    ),
    []
);

const [useCapitalButtons] = bind(
    altCosts$.pipe(
        map((costs) =>
            costs.map((cost) => {
                const button = costButton(cost);
                return <button.component key={cost.id} />;
            })
        )
    ),
    []
);

const [useContractButtons] = bind(
    altCosts$.pipe(
        map((costs) =>
            costs.map((cost) => {
                const button = costButton(cost);
                return <button.component key={cost.id} />;
            })
        )
    ),
    []
);

const [useOtherButtons] = bind(
    altCosts$.pipe(
        map((costs) =>
            costs.map((cost) => {
                const button = costButton(cost);
                return <button.component key={cost.id} />;
            })
        )
    ),
    []
);

const { component: EnergyCollapse } = collapse();
const { component: WaterCollapse } = collapse();
const { component: CapitalCollapse } = collapse();
const { component: ContractCollapse } = collapse();
const { component: OtherCollapse } = collapse();

export default function CostNavigation() {
    const costs = Model.useCosts();

    const waterCosts = costs.filter(isWaterCost);
    const energyCosts = costs.filter(isEnergyCost);
    const capitalCosts = costs.filter(isCapitalCost);
    const contractCosts = costs.filter(isContractCost);
    const otherCosts = costs.filter(isOtherCost);

    return (
        <div className="flex h-full w-fit flex-col gap-2 whitespace-nowrap bg-primary p-2 text-base-lightest">
            <EnergyCollapse title={"Energy Costs"} icon={mdiLightningBolt}>
                {useEnergyButtons()}
            </EnergyCollapse>
            <WaterCollapse title={"Water Costs"} icon={mdiWater}>
                {useWateryButtons()}
            </WaterCollapse>
            <CapitalCollapse title={"Capital Costs"} icon={mdiCurrencyUsd}>
                {useCapitalButtons()}
            </CapitalCollapse>
            <ContractCollapse title={"Contract Costs"} icon={mdiFileSign}>
                {useContractButtons()}
            </ContractCollapse>
            <OtherCollapse title={"Other Costs"} icon={mdiFormatListBulletedType}>
                {useOtherButtons()}
            </OtherCollapse>
        </div>
    );
}
