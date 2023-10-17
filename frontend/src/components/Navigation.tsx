import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
    LaptopOutlined,
    NotificationOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";

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
    getItem("General Information", "1", <PieChartOutlined />),
    getItem("Alternative Summary", "2", <DesktopOutlined />),
    getItem("Alternatives", "sub1", <UserOutlined />, [getItem("Tom", "3"), getItem("Bill", "4"), getItem("Alex", "5")])
];

const items2: MenuProps["items"] = [UserOutlined, LaptopOutlined, NotificationOutlined].map((icon, index) => {
    const key = String(index + 1);

    return {
        key: `sub${key}`,
        icon: React.createElement(icon),
        label: `subnav ${key}`,

        children: new Array(4).fill(null).map((_, j) => {
            const subKey = index * 4 + j + 1;
            return {
                key: subKey,
                label: `option${subKey}`
            };
        })
    };
});

export default function Navigation() {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer }
    } = theme.useToken();
    return (
        <>
            {/* <div className={"w-fit h-full bg-base-light"}>Navigation</div> */}
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical" />
                <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items} />
            </Sider>
            <Outlet />
        </>
    );
}
