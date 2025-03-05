import { mdiFormatListGroup, mdiFormatListText, mdiListBoxOutline, mdiTextBoxEditOutline } from "@mdi/js";
import { bind } from "@react-rxjs/core";
import ShareOfEnergyUse from "components/graphs/alternative-results/ShareOfEnergyUse";
import NpvCashFlowGraph from "components/graphs/annual-results/NpvCashFlowGraph";
import { Button } from "components/input/Button";
import { useActiveLink } from "hooks/UseActiveLink";
import { ResultModel } from "model/ResultModel";
import type { PropsWithChildren } from "react";
import { Outlet, useNavigate } from "react-router-dom";

function OffScreenWrapper({ children }: PropsWithChildren) {
    return <div style={{ position: "absolute", left: 0, top: "0vh", width: 750 }}>{children}</div>;
}

export default function ResultNavigation() {
    const navigate = useNavigate();
    const measures = ResultModel.useMeasures();
    console.log(measures);

    return (
        <>
            <OffScreenWrapper>
                <NpvCashFlowGraph offscreen />
            </OffScreenWrapper>
            {measures.map((measure, i) => (
                <OffScreenWrapper key={`${measure.totalCosts}-${i}`}>
                    <ShareOfEnergyUse offscreen measure={measure} />
                </OffScreenWrapper>
            ))}

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
