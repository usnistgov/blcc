import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Layout, Menu } from "antd";
import { map, withLatestFrom } from "rxjs";
import { Model } from "../model/Model";
import { bind } from "@react-rxjs/core";
import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";
import { createSignal } from "@react-rxjs/utils";
import { Alternative } from "../blcc-format/Format";

const { Sider } = Layout;

const background = "rgb(0 94 162)";

// Stream of new alternatives to add to project. Will be replaced with a modal to get the name
const [addAlternativeClick$, addAlternative] = createSignal();
const addAlternative$ = addAlternativeClick$.pipe(
    //TODO open modal instead
    withLatestFrom(Model.alternatives$),
    map(([_, alternatives]) => {
        const nextID = getNewID(alternatives);

        return {
            id: nextID,
            name: `New Alternative ${nextID}`,
            costs: []
        };
    })
);

function getNewID(alternatives: Alternative[]) {
    const ids = alternatives.map((alt) => alt.id);
    const newID = Math.max(...ids) + 1;

    if (newID < 0) return 0;

    return newID;
}

export { addAlternative$ };

const [useMenuItems] = bind(
    Model.alternatives$.pipe(
        map((alternatives) =>
            alternatives.map((alt) => ({
                key: alt.id,
                label: alt.name
            }))
        ),
        map((alternativeMenuItems) => [
            {
                key: "gen-info",
                label: "General Information"
            },
            {
                key: "",
                label: "Alternative Summary"
            },
            {
                key: "alternatives",
                label: "Alternatives",
                children: [
                    {
                        key: "add-alt",
                        label: "Add Alternative",
                        icon: <Icon path={mdiPlus} size={0.8} />
                    },
                    ...alternativeMenuItems
                ]
            }
        ])
    ),
    []
);

export default function Navigation() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    return (
        <>
            <Layout>
                <Sider
                    style={{ background }}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                >
                    <div className="demo-logo-vertical" style={{ background }} />
                    <Menu
                        className={"bg-primary text-white"}
                        mode="inline"
                        defaultSelectedKeys={["gen-info"]}
                        onClick={({ key }) => {
                            if (key === "gen-info") {
                                navigate(`/editor/`); // Call your click handler
                            } else if (key === "add-alt") {
                                addAlternative();
                            } else {
                                navigate(`/editor/alternative/${key}`);
                            }
                        }}
                        items={useMenuItems()}
                    />
                </Sider>
            </Layout>
            <Outlet />
        </>
    );
}
