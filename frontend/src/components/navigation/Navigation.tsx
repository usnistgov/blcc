import { mdiAlphaBBox, mdiFileDocument, mdiFileTree, mdiViewList } from "@mdi/js";
import Icon from "@mdi/react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { match } from "ts-pattern";
import { useActiveLink } from "../../hooks/UseActiveLink";
import { sAlternativeID$ } from "../../model/AlternativeModel";
import { useAlternatives } from "../../model/Model";
import { Button, ButtonType } from "../Button";

/*
 *  Component representing the navigation button for an alternative
 */
function AltButton({ altID, name, icon }: { altID: number; name: string; icon?: string }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Button
            key={altID}
            className={useActiveLink(`/editor/alternative/${altID}/*`)}
            type={ButtonType.PRIMARY}
            icon={icon}
            onClick={() => {
                sAlternativeID$.next(altID);

                if (!location.pathname.endsWith(`/editor/alternative/${altID}`))
                    navigate(`/editor/alternative/${altID}`);
            }}
        >
            {name}
        </Button>
    );
}

/**
 *  The main navigation component for the editor portion of the application. Has links to the
 *  General information page, the alternative summary page, and to all the alternatives.
 */
export default function Navigation() {
    const navigate = useNavigate();

    return (
        <>
            <nav className="z-40 flex h-full w-fit flex-col gap-2 bg-primary p-2 text-base-lightest shadow-lg">
                {/* Top level buttons */}
                <Button
                    className={`whitespace-nowrap ${useActiveLink("/editor")}`}
                    icon={mdiFileDocument}
                    onClick={() => {
                        navigate("/editor");
                    }}
                >
                    General Information
                </Button>
                <Button
                    className={`whitespace-nowrap ${useActiveLink("/editor/alternative")}`}
                    icon={mdiViewList}
                    onClick={() => navigate("/editor/alternative")}
                >
                    Alternative Summary
                </Button>

                {/* Alternative buttons */}
                <span className={"flex flex-row place-items-center px-2 py-1 select-none"}>
                    <Icon className={"mr-1 min-w-[24px]"} path={mdiFileTree} size={0.8} />
                    Alternatives
                </span>
                <div className={"flex flex-col gap-2 pl-8"}>
                    {match([...useAlternatives().values()])
                        .when(
                            (alts) => alts.length <= 0,
                            () => <p className={"text-base-light"}>No Alternatives</p>,
                        )
                        .otherwise((alts) =>
                            alts.map((alt) => (
                                <AltButton
                                    key={alt.id}
                                    altID={alt.id ?? 0}
                                    name={alt.name}
                                    icon={alt.baseline ? mdiAlphaBBox : undefined}
                                />
                            )),
                        )}
                </div>
            </nav>
            <Outlet />
        </>
    );
}