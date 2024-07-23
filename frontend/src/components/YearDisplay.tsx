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
                        <p className={"text-blue-500 basis-0"}>
                            {i === 0 && "(20)"}
                            {(releaseYear + i).toString().substring(2)}
                        </p>,
                    );
                }

                for (let i = 0; i < (studyPeriod ?? 0); i++) {
                    result.push(
                        <p className={"text-green-500 basis-0"}>
                            {(releaseYear + constructionPeriod + i).toString().substring(2)}
                        </p>,
                    );
                }

                return result;
            }),
        );

        return [state(years$, [])];
    }, []);

    const years = useStateObservable(years$);

    return (
        <div className={"grid text-xs w-full justify-between auto-cols-auto grid-flow-col"}>
            {above}
            <div className={"h-0 col-span-full"} />
            {years}
        </div>
    );
}
