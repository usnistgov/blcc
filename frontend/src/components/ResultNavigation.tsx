import { mdiFormatListGroup, mdiFormatListText, mdiListBoxOutline, mdiTextBoxEditOutline } from "@mdi/js";
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import button from "./Button";
import { useSubscribe } from "../hooks/UseSubscribe";

const { click$: inputClick$, component: InputButton } = button();
const { click$: annualResultsClick$, component: AnnualResultsButton } = button();
const { click$: alternativeResultsClick$, component: AlternativeResultsButton } = button();
const { click$: summaryClick$, component: SummaryButton } = button();

export default function ResultNavigation() {
    const navigate = useNavigate();
    useSubscribe(inputClick$, () => navigate("/results"), [navigate]);
    useSubscribe(annualResultsClick$, () => navigate("/results/annual"), [navigate]);
    useSubscribe(alternativeResultsClick$, () => navigate("/results/alternative"), [navigate]);
    useSubscribe(summaryClick$, () => navigate("/results/summary"), [navigate]);

    return (
        <>
            <div className="flex h-full w-56 flex-col gap-2 bg-primary p-2 text-base-lightest">
                <InputButton icon={mdiTextBoxEditOutline}>Inputs</InputButton>
                <AnnualResultsButton icon={mdiListBoxOutline}>Annual Results</AnnualResultsButton>
                <AlternativeResultsButton icon={mdiFormatListGroup}>Alternative Results</AlternativeResultsButton>
                <SummaryButton icon={mdiFormatListText}>Summary</SummaryButton>
            </div>
            <Outlet />
        </>
    );
}
