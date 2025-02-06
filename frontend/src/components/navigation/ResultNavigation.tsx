import { mdiFormatListGroup, mdiFormatListText, mdiListBoxOutline, mdiTextBoxEditOutline } from "@mdi/js";
import { Button } from "components/input/Button";
import { useActiveLink } from "hooks/UseActiveLink";
import { Outlet, useNavigate } from "react-router-dom";

export default function ResultNavigation() {
    const navigate = useNavigate();
    return (
        <>
            <nav className="z-40 flex h-full w-60 flex-col gap-2 bg-primary p-2 text-base-lightest shadow-lg">
                <Button
                    className={useActiveLink("/results")}
                    icon={mdiFormatListText}
                    onClick={() => navigate("/results")}
                >
                    Summary
                </Button>
                <Button
                    className={useActiveLink("/results/annual")}
                    icon={mdiListBoxOutline}
                    onClick={() => navigate("/results/annual")}
                >
                    Annual Results
                </Button>
                <Button
                    className={useActiveLink("/results/alternative")}
                    icon={mdiFormatListGroup}
                    onClick={() => navigate("/results/alternative")}
                >
                    Alternative Results
                </Button>
                <Button
                    className={useActiveLink("/results/inputs")}
                    icon={mdiTextBoxEditOutline}
                    onClick={() => navigate("/results/inputs")}
                >
                    Inputs
                </Button>
            </nav>
            <Outlet />
        </>
    );
}
