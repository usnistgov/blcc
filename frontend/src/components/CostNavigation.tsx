import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu, Typography } from "antd";
import Icon from "@mdi/react";
import {
    mdiPlus,
    mdiLightningBolt,
    mdiWater,
    mdiFileSign,
    mdiCurrencyUsd,
    mdiFormatListBulletedType,
    mdiEmailOutline
} from "@mdi/js";

const { Sider } = Layout;
const { Item, SubMenu } = Menu;
const { Title } = Typography;

type MenuItem = {
    key: React.Key;
    icon?: React.ReactNode;
    label: React.ReactNode;
    items?: MenuItem[];
};

// will repalce once Model is set
const energy = [
    {
        key: "add-energy-cost",
        icon: <Icon path={mdiPlus} size={1} />,
        label: (
            <React.Fragment>
                <span className="flex items-center">
                    <Icon path={mdiPlus} size={1} />
                    Add Energy Cost
                </span>
            </React.Fragment>
        )
    }
];
for (let i = 1; i < 4; i++) {
    energy.push({
        key: `energy/${i}`,
        label: <React.Fragment>Energy Cost {i}</React.Fragment>,
        icon: <Icon path={mdiPlus} size={1} />
    });
}

const water = [
    {
        key: "add-water-cost",
        icon: <Icon path={mdiPlus} size={1} />,
        label: (
            <React.Fragment>
                <span className="flex items-center">
                    <Icon path={mdiPlus} size={1} />
                    Add Water Cost
                </span>
            </React.Fragment>
        )
    }
];
for (let i = 1; i < 4; i++) {
    water.push({
        key: `water/${i}`,
        label: <React.Fragment>Water Cost {i}</React.Fragment>,
        icon: <Icon path={mdiPlus} size={1} />
    });
}

const capital = [
    {
        key: "add-capital-cost",
        icon: <Icon path={mdiPlus} size={1} />,
        label: (
            <React.Fragment>
                <span className="flex items-center">
                    <Icon path={mdiPlus} size={1} />
                    Add Capital Cost
                </span>
            </React.Fragment>
        )
    }
];
for (let i = 1; i < 4; i++) {
    capital.push({
        key: `capital/${i}`,
        label: <React.Fragment>Capital Cost {i}</React.Fragment>,
        icon: <Icon path={mdiPlus} size={1} />
    });
}

const contract = [
    {
        key: "add-contract-cost",
        icon: <Icon path={mdiPlus} size={1} />,
        label: (
            <React.Fragment>
                <span className="flex items-center">
                    <Icon path={mdiPlus} size={1} />
                    Add Contract Cost
                </span>
            </React.Fragment>
        )
    }
];
for (let i = 1; i < 4; i++) {
    contract.push({
        key: `contract/${i}`,
        label: <React.Fragment>Contract Cost {i}</React.Fragment>,
        icon: <Icon path={mdiPlus} size={1} />
    });
}

const items: MenuItem["items"] = [
    {
        key: "energy-costs",
        icon: <Icon path={mdiLightningBolt} size={1} />,
        label: "Energy Costs",
        items: energy
    },
    {
        key: "water-costs",
        icon: <Icon path={mdiWater} size={1} />,
        label: "Water Costs",
        items: water
    },
    {
        key: "capital-costs",
        icon: <Icon path={mdiCurrencyUsd} size={1} />,
        label: "Capital Costs",
        items: capital
    },
    {
        key: "contract-costs",
        icon: <Icon path={mdiFileSign} size={1} />,
        label: "Contract Costs",
        items: contract
    },
    {
        key: "other",
        icon: <Icon path={mdiFormatListBulletedType} size={1} />,
        label: "Other",
        items: [
            {
                key: "energy-costs",
                icon: <Icon path={mdiLightningBolt} size={1} />,
                label: "Energy Costs"
            },
            { key: "energy-costs", icon: <Icon path={mdiEmailOutline} size={1} />, label: "Energy Costs" }
        ]
    }
];

const background = "rgb(0 94 162)";

export default function CostNavigation() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
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
                        defaultSelectedKeys={["1"]}
                        defaultOpenKeys={["sub1"]}
                        mode="inline"
                        inlineCollapsed={collapsed}
                    >
                        {items.map((item) =>
                            item.items ? (
                                <SubMenu key={item.key} icon={item.icon} title={item.label}>
                                    {item.items.map((child) => (
                                        <Item key={child.key}>{child.label}</Item>
                                    ))}
                                </SubMenu>
                            ) : (
                                <Item key={item.key} icon={item.icon}>
                                    {item.label}
                                </Item>
                            )
                        )}
                    </Menu>
                </Sider>
            </Layout>
            <Outlet />
        </>
    );
}
