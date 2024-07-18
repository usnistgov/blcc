import { state, useStateObservable } from "@react-rxjs/core";
import { Model } from "model/Model";
import { type ReactNode, useMemo } from "react";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";

type YearDisplayProps = {
    above?: ReactNode[];
};

export default function YearDisplay({ above }: YearDisplayProps) {
    const [years$] = useMemo(() => {
        const years$ = combineLatest([Model.releaseYear$, Model.studyPeriod$, Model.constructionPeriod$]).pipe(
            map(([releaseYear, studyPeriod, constructionPeriod]) => {
                const result = [];

                for (let i = 0; i < constructionPeriod; i++) {
                    result.push(
                        <div className={"table-cell"}>
                            <p className={"text-blue-500"}>
                                {i === 0 && "(20)"}
                                {(releaseYear + i).toString().substring(2)}
                            </p>
                        </div>,
                    );
                }

                for (let i = 0; i < (studyPeriod ?? 0); i++) {
                    result.push(
                        <div className={"table-cell"}>
                            <p className={"text-green-500"}>
                                {(releaseYear + constructionPeriod + i).toString().substring(2)}
                            </p>
                        </div>,
                    );
                }

                return result;
            }),
        );

        return [state(years$, [])];
    }, []);

    const years = useStateObservable(years$);

    return (
        <div className={"table text-xs w-full"}>
            <div className={"table-row-group"}>
                <div className={"table-row"}>{above}</div>
                <div className={"table-row"}>{years}</div>
            </div>
        </div>
    );
}
