import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { AlternativeModel } from "../model/AlternativeModel";
import { CostModel } from "../model/CostModel";

export default function useParamSync() {
    const { alternativeID, costID } = useParams();
    useLayoutEffect(() => {
        if (alternativeID !== undefined) AlternativeModel.sID$.next(Number.parseInt(alternativeID));

        if (costID !== undefined) CostModel.id$.next(Number.parseInt(costID));
    }, [alternativeID, costID]);
}
