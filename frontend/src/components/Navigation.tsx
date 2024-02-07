import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { map } from "rxjs";
import { alternatives$ } from "../model/Model";
import { bind } from "@react-rxjs/core";
import { Alternative } from "../blcc-format/Format";
import button, { ButtonType } from "./Button";
import { useSubscribe } from "../hooks/UseSubscribe";
import collapse from "./Collapse";
import { mdiAlphaBBox, mdiFileDocument, mdiFileTree, mdiViewList } from "@mdi/js";

function altButton(alt: Alternative) {
    const { click$, component: Button } = button();

    return {
        component: function AltButton({ icon }: { icon?: string }) {
            const navigate = useNavigate();
            useSubscribe(click$, () => navigate(`/editor/alternative/${alt.id}`));
            return (
                <Button key={alt.id} type={ButtonType.PRIMARY} icon={icon}>
                    {alt.name}
                </Button>
            );
        }
    };
}

const [useMenuItems] = bind(
    alternatives$.pipe(
        map((alternatives) =>
            [...alternatives.values()].map((alt) => {
                const button = altButton(alt);
                return <button.component key={alt.id} icon={alt.baseline ? mdiAlphaBBox : undefined} />;
            })
        )
    ),
    []
);

const { click$: generalInformationClick$, component: GeneralInformationButton } = button();
const { click$: alternativeSummaryClick$, component: AlternativeSummaryButton } = button();
const { component: AlternativeSubMenu } = collapse();

export default function Navigation() {
    const navigate = useNavigate();

    useSubscribe(generalInformationClick$, () => navigate("/editor"));
    useSubscribe(alternativeSummaryClick$, () => navigate("/editor/alternative"));

    return (
        <>
            <div className="flex h-full w-fit flex-col gap-2 bg-primary p-2 text-base-lightest">
                <GeneralInformationButton
                    type={ButtonType.PRIMARY}
                    className={"whitespace-nowrap"}
                    icon={mdiFileDocument}
                >
                    General Information
                </GeneralInformationButton>
                <AlternativeSummaryButton type={ButtonType.PRIMARY} className={"whitespace-nowrap"} icon={mdiViewList}>
                    Alternative Summary
                </AlternativeSummaryButton>
                <AlternativeSubMenu title={"Alternatives"} icon={mdiFileTree}>
                    {useMenuItems()}
                </AlternativeSubMenu>
            </div>
            <Outlet />
        </>
    );
}
