import { mdiFormatListGroup, mdiFormatListText, mdiListBoxOutline, mdiTextBoxEditOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { Layout, Menu } from "antd";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const { Sider } = Layout;

type MenuItem = {
    key: React.Key;
    icon?: React.ReactNode;
    label: React.ReactNode;
    items?: MenuItem[];
};

const items: MenuItem[] = [
    {
        key: "input",
        icon: <Icon path={mdiTextBoxEditOutline} size={1} />,
        label: "Input"
    },
    {
        key: "annual",
        icon: <Icon path={mdiListBoxOutline} size={1} />,
        label: "Annual Results"
    },
    {
        key: "alternative",
        icon: <Icon path={mdiFormatListGroup} size={1} />,
        label: "Results by Alternative"
    },
    {
        key: "summary",
        icon: <Icon path={mdiFormatListText} size={1} />,
        label: "Summary"
    }
];

const background = "rgb(0 94 162)";

export default function ResultNavigation() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    return (
        <>
            <Layout style={{ background }}>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    style={{ background }}
                >
                    <Menu
                        style={{ background, color: "#fff" }}
                        mode="inline"
                        defaultSelectedKeys={["gen-info"]}
                        onClick={({ key }) => {
                            if (key === "input") {
                                navigate(`/results/`); // Call your click handler
                            } else {
                                navigate(`/results/${key}`);
                            }
                        }}
                        items={items}
                    />
                </Sider>
            </Layout>
            <Outlet />
        </>
    );
}
