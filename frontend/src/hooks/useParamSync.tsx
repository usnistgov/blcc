import { AlternativeModel } from "model/AlternativeModel";
import { CostModel } from "model/CostModel";
import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";

/**
 * Syncs the alternative ID and the cost ID from the URL parameters to the RXJS model. This allows direct links to be
 * rendered by loading in the proper model state from the URL.
 */
export default function useParamSync() {
    const { alternativeID, costID } = useParams();

    // We use layout effect since we want this to happen *before* any real rendering to allow the RXJS model to settle.
    useLayoutEffect(() => {
        // Load the alternative ID if it exists
        if (alternativeID !== undefined) AlternativeModel.sID$.next(Number.parseInt(alternativeID));

        // Load the cost ID if it exists
        if (costID !== undefined) CostModel.sId$.next(Number.parseInt(costID));
    }, [alternativeID, costID]);
}

// FIXME: This is a bit of a hack to load the current url parameters into the model with the suspense fallback in Editor
export function Sync() {
    useParamSync();
    return <></>;
}
