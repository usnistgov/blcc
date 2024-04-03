import { mdiFormatListGroup, mdiFormatListText, mdiListBoxOutline, mdiTextBoxEditOutline } from "@mdi/js";
import { Outlet, useNavigate } from "react-router-dom";
import button from "./../Button";
import { useSubscribe } from "../../hooks/UseSubscribe";
import { useActiveLink } from "../../hooks/UseActiveLink";

const { click$: inputClick$, component: InputButton } = button();
const { click$: annualResultsClick$, component: AnnualResultsButton } = button();
const { click$: alternativeResultsClick$, component: AlternativeResultsButton } = button();
const { click$: summaryClick$, component: SummaryButton } = button();

export default function ResultNavigation() {
    const navigate = useNavigate();

    useSubscribe(summaryClick$, () => navigate("/results"), [navigate]);
    useSubscribe(annualResultsClick$, () => navigate("/results/annual"), [navigate]);
    useSubscribe(alternativeResultsClick$, () => navigate("/results/alternative"), [navigate]);
    useSubscribe(inputClick$, () => navigate("/results/inputs"), [navigate]);

    return (
        <>
            <div className="flex h-full w-60 flex-col gap-2 bg-primary p-2 text-base-lightest">
                <SummaryButton className={useActiveLink("/results")} icon={mdiFormatListText}>
                    Summary
                </SummaryButton>
                <AnnualResultsButton className={useActiveLink("/results/annual")} icon={mdiListBoxOutline}>
                    Annual Results
                </AnnualResultsButton>
                <AlternativeResultsButton className={useActiveLink("/results/alternative")} icon={mdiFormatListGroup}>
                    Alternative Results
                </AlternativeResultsButton>
                <InputButton className={useActiveLink("/results/inputs")} icon={mdiTextBoxEditOutline}>
                    Inputs
                </InputButton>
            </div>
            <Outlet />
        </>
    );
}
