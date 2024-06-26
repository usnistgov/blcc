import { type PropsWithChildren, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlternativeModel } from "../model/AlternativeModel";
import { CostModel } from "../model/CostModel";

export default function SyncUrlParams({ children }: PropsWithChildren) {
    const { alternativeID, costID } = useParams();
    console.log(useParams());

    useEffect(() => {
        console.log("Alternative ID", alternativeID, "Cost ID", costID);

        AlternativeModel.sID$.next(Number.parseInt(alternativeID ?? "0"));
        CostModel.id$.next(Number.parseInt(costID ?? "0"));
    }, [alternativeID, costID]);

    return <>{children}</>;
}
