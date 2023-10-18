import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { DesktopOutlined, PieChartOutlined, UserOutlined } from "@ant-design/icons";
import { Layout, Menu, type MenuProps } from "antd";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
    return {
        key,
        icon,
        children,
        label
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem("General Information", "gen-info", <PieChartOutlined />),
    getItem("Alternative Summary", "alt-sum", <DesktopOutlined />),
    getItem("Alternatives", "alt", <UserOutlined />, [
        getItem("Alternatives 1", "alt-1"),
        getItem("Alternatives 2", "alt-2"),
        getItem("Alternatives 3", "alt-3")
    ])
];

export default function Navigation() {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <>
            <Layout style={{ minHeight: "100vh", background: "rgb(0 94 162)" }}>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    style={{ background: "rgb(0 94 162)" }}
                >
                    <div className="demo-logo-vertical" style={{ background: "rgb(0 94 162)" }} />
                    <Menu
                        style={{ background: "rgb(0 94 162)", color: "#fff" }}
                        defaultSelectedKeys={["gen-info"]}
                        mode="inline"
                        items={items}
                    />
                </Sider>
            </Layout>
            <Outlet />
        </>
    );
}
