import { mdiAlphaBBox, mdiFileDocument, mdiViewList } from "@mdi/js";
import { Subscribe } from "@react-rxjs/core";
import { Button, ButtonType } from "components/input/Button";
import { useActiveLink } from "hooks/UseActiveLink";
import { AlternativeModel } from "model/AlternativeModel";
import { useAlternatives } from "model/Model";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

/*
 *  Component representing the navigation button for an alternative
 */
function AltButton({
    altID,
    name,
    icon,
    baseCase,
}: { altID: number; name: string; icon?: string; baseCase?: boolean }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Button
            key={altID}
            className={`${useActiveLink(
                `/editor/alternative/${altID}/*`,
            )} overflow-hidden text-ellipsis text-nowrap text-left`}
            type={ButtonType.PRIMARY}
            icon={icon}
            disabled={baseCase}
            disabledDark={true}
            onClick={() => {
                AlternativeModel.sID$.next(altID);

                if (!location.pathname.endsWith(`/editor/alternative/${altID}`))
                    navigate(`/editor/alternative/${altID}`);
            }}
        >
            <p className={"w-full overflow-hidden text-ellipsis"}>{name}</p>
        </Button>
    );
}

/**
 *  The main navigation component for the editor portion of the application. Has links to the
 *  General information page, the alternative summary page, and to all the alternatives.
 */
export default function Navigation() {
    return (
        <>
            <nav className="z-40 flex h-full w-fit max-w-64 flex-col gap-2 bg-primary p-2 text-base-lightest shadow-lg">
                {/* Top level buttons */}
                <GeneralInformationButton />
                <AlternativesButton />

                {/* Alternative buttons */}
                <Subscribe>
                    <AlternativeList />
                </Subscribe>
            </nav>
            <Outlet />
        </>
    );
}

function GeneralInformationButton() {
    const navigate = useNavigate();

    return (
        <Button
            className={`whitespace-nowrap ${useActiveLink("/editor")}`}
            icon={mdiFileDocument}
            onClick={() => {
                navigate("/editor");
            }}
        >
            General Information
        </Button>
    );
}

function AlternativesButton() {
    const navigate = useNavigate();

    return (
        <Button
            className={`whitespace-nowrap ${useActiveLink("/editor/alternative")}`}
            icon={mdiViewList}
            onClick={() => navigate("/editor/alternative")}
        >
            Alternatives
        </Button>
    );
}

function AlternativeList() {
    const alternatives = useAlternatives();

    return (
        <div className={"custom-scrollbar overflow-y-auto"}>
            <div className={"flex flex-col gap-2 pl-8"}>
                {alternatives.length <= 0 ? (
                    <p className={"text-base-light"}>No Alternatives</p>
                ) : (
                    alternatives
                        .sort((alt1, alt2) => (alt1.ERCIPBaseCase ? -1 : 1))
                        .map((alt) => (
                            <AltButton
                                key={alt.id}
                                altID={alt.id ?? 0}
                                name={alt.name}
                                baseCase={alt.ERCIPBaseCase}
                                icon={alt.baseline ? mdiAlphaBBox : undefined}
                            />
                        ))
                )}
            </div>
        </div>
    );
}
