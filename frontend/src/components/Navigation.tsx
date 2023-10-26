import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu } from "antd";

const { Sider } = Layout;

const { Item, SubMenu } = Menu;

type MenuItem = {
    key: React.Key;
    icon?: React.ReactNode;
    label: React.ReactNode;
    items?: MenuItem[];
};

// will repalce once Model is set
const alternatives = [];
for (let i = 1; i < 4; i++) {
    alternatives.push({
        key: `alternative/${i}`,
        label: `Alternative ${i}`
    });
}

const items: MenuItem[] = [
    {
        key: "gen-info",
        label: "General Information"
    },
    {
        key: "alternative",
        label: "Alternative Summary"
    },
    {
        key: "alternatives",
        label: "Alternatives",
        items: alternatives
    }
];

const background = "rgb(0 94 162)";

export default function Navigation() {
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
                    <div className="demo-logo-vertical" style={{ background }} />
                    <Menu
                        style={{ background, color: "#fff" }}
                        mode="inline"
                        defaultSelectedKeys={["gen-info"]}
                        onClick={({ key }) => {
                            if (key === "gen-info") {
                                navigate(`/editor/`); // Call your click handler
                            } else {
                                navigate(`/editor/${key}`);
                            }
                        }}
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
