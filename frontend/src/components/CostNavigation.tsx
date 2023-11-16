import { mdiCurrencyUsd, mdiFileSign, mdiFormatListBulletedType, mdiLightningBolt, mdiPlus, mdiWater } from "@mdi/js";
import Icon from "@mdi/react";
import { Layout, Menu, Typography } from "antd";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { Cost } from "../blcc-format/Format";
import { Model } from "../model/Model";
import { isCapitalCost, isContractCost, isEnergyCost, isOtherCost, isWaterCost } from "../util/Util";

const { Sider } = Layout;
const { Title } = Typography;

type MenuItem = {
    key: React.Key;
    icon?: React.ReactNode;
    label: React.ReactNode;
    children?: MenuItem[];
};

const rootSubmenuKeys: string[] = ["energy-costs", "water-costs", "capital-costs", "contract-costs", "other"];

const background = "rgb(0 94 162)";

export default function CostNavigation() {
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState(["energy-costs"]);
    const navigate = useNavigate();
    const costs = Model.useCosts();

    const onOpenChange = (keys: string[]) => {
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
            setOpenKeys(keys);
        } else {
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    };

    const waterCosts = costs.filter(isWaterCost);
    const energyCosts = costs.filter(isEnergyCost);
    const capitalCosts = costs.filter(isCapitalCost);
    const contractCosts = costs.filter(isContractCost);
    const otherCosts = costs.filter(isOtherCost);

    const retrieveSubMenu = (costs: Cost[], key: string, arr: MenuItem[]) => {
        for (let i = 0; i < costs.length; i++) {
            arr.push({
                key: `${costs[i]?.id}`,
                label: costs[i]?.name ? (
                    <React.Fragment>{costs[i]?.name}</React.Fragment>
                ) : (
                    <React.Fragment>{key} (No Name)</React.Fragment>
                )
            });
        }
    };

    const addCostItem = (cost: string) => {
        return (
            <React.Fragment>
                <span className="flex items-center">
                    <Icon path={mdiPlus} size={1} />
                    Add {cost} Cost
                </span>
            </React.Fragment>
        );
    };

    const energy = [
        {
            key: "add-energy-cost",
            icon: <Icon path={mdiPlus} size={1} />,
            label: addCostItem("Energy")
        }
    ];

    const water = [
        {
            key: "add-water-cost",
            icon: <Icon path={mdiPlus} size={1} />,
            label: addCostItem("Water")
        }
    ];

    const capital = [
        {
            key: "add-capital-cost",
            icon: <Icon path={mdiPlus} size={1} />,
            label: addCostItem("Capital")
        }
    ];

    const other = [
        {
            key: "add-other-cost",
            icon: <Icon path={mdiPlus} size={1} />,
            label: addCostItem("Other")
        }
    ];

    const contract = [
        {
            key: "add-contract-cost",
            icon: <Icon path={mdiPlus} size={1} />,
            label: addCostItem("Contract")
        }
    ];

    retrieveSubMenu(energyCosts, "energy", energy);
    retrieveSubMenu(waterCosts, "water", water);
    retrieveSubMenu(capitalCosts, "capital", capital);
    retrieveSubMenu(contractCosts, "contract", contract);
    retrieveSubMenu(otherCosts, "other", other);

    const items: MenuItem["children"] = [
        {
            key: "energy-costs",
            icon: <Icon path={mdiLightningBolt} size={1} />,
            label: "Energy Costs",
            children: energy
        },
        {
            key: "water-costs",
            icon: <Icon path={mdiWater} size={1} />,
            label: "Water Costs",
            children: water
        },
        {
            key: "capital-costs",
            icon: <Icon path={mdiCurrencyUsd} size={1} />,
            label: "Capital Costs",
            children: capital
        },
        {
            key: "contract-costs",
            icon: <Icon path={mdiFileSign} size={1} />,
            label: "Contract Costs",
            children: contract
        },
        {
            key: "other",
            icon: <Icon path={mdiFormatListBulletedType} size={1} />,
            label: "Other",
            children: other
        }
    ];

    return (
        <>
            <Layout className="bg-primary">
                <Sider
                    style={{ background, color: "#fff" }}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                >
                    <Title style={{ textAlign: "center", color: "#fff", marginBottom: "0" }} level={4}>
                        Cost
                    </Title>
                    <Menu
                        className="bg-primary text-white"
                        mode="inline"
                        openKeys={openKeys}
                        onOpenChange={onOpenChange}
                        onClick={({ key }: { key: string }) => navigate(`/editor/alternative/${key}`)}
                        items={items}
                    />
                </Sider>
            </Layout>
            <Outlet />
        </>
    );
}
