import { mdiFormatListGroup, mdiFormatListText, mdiListBoxOutline, mdiTextBoxEditOutline } from "@mdi/js";
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import button from "./../Button";
import { useSubscribe } from "../../hooks/UseSubscribe";

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
                <SummaryButton icon={mdiFormatListText}>Summary</SummaryButton>
                <AnnualResultsButton icon={mdiListBoxOutline}>Annual Results</AnnualResultsButton>
                <AlternativeResultsButton icon={mdiFormatListGroup}>Alternative Results</AlternativeResultsButton>
                <InputButton icon={mdiTextBoxEditOutline}>Inputs</InputButton>
            </div>
            <Outlet />
        </>
    );
}
