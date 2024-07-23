import { state, useStateObservable } from "@react-rxjs/core";
import { Model } from "model/Model";
import { type ReactNode, useMemo } from "react";
import { combineLatest, from, mergeAll, zip } from "rxjs";
import { map, toArray } from "rxjs/operators";

type YearDisplayProps = {
    above?: ReactNode[];
};

export default function YearDisplay({ above }: YearDisplayProps) {
    const [years$] = useMemo(() => {
        const years$ = combineLatest([Model.releaseYear$, Model.studyPeriod$, Model.constructionPeriod$]).pipe(
            map(([releaseYear, studyPeriod, constructionPeriod]) => {
                const result = [];

                for (let i = 0; i < constructionPeriod; i++) {
                    result.push(<p className={"text-blue-500"}>{(releaseYear + i).toString().substring(2)}</p>);
                }

                for (let i = 0; i < (studyPeriod ?? 0); i++) {
                    result.push(
                        <p className={"text-green-500"}>
                            {(releaseYear + constructionPeriod + i).toString().substring(2)}
                        </p>,
                    );
                }

                return result;
            }),
        );

        return [state(years$, [])];
    }, [above]);

    const years = useStateObservable(years$);

    return (
        <div className={"flex text-xs w-full justify-between flex-col flex-wrap h-8"}>
            {above?.flatMap((above, i) => [
                above,
                years[i],
                <div key={`column-break-${i}`} className={"basis-full"} />,
            ])}
        </div>
    );
}
