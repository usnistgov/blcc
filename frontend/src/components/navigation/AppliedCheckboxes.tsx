import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { Checkbox } from "antd";
import type { ID } from "blcc-format/Format";
import { useSubscribe } from "hooks/UseSubscribe";
import { useAlternatives } from "model/Model";
import { useMemo } from "react";
import { EMPTY, type Observable, type Subject, iif } from "rxjs";
import { startWith } from "rxjs/operators";
import { gatherSet } from "util/Operators";

type AppliedCheckboxesProps = {
    defaults?: ID[];
    value$?: Observable<Set<ID>>;
    wire: Subject<Set<ID>>;
};

export default function AppliedCheckboxes({ defaults = [], value$, wire }: AppliedCheckboxesProps) {
    const [useState, state$, toggle] = useMemo(() => {
        const [toggle$, toggle] = createSignal<[ID, boolean]>();
        const state$ = iif(
            () => value$ === undefined,
            toggle$.pipe(gatherSet(...defaults), startWith(new Set(defaults))),
            value$ ?? EMPTY,
        );
        const [useState] = bind(state$, new Set());

        return [useState, state$, toggle];
    }, [defaults, value$]);

    useSubscribe(state$, wire);

    const alternatives = useAlternatives();
    const state = useState();

    return (
        <div className={"grid gap-2"}>
            {alternatives.map((alt) => (
                <Checkbox
                    key={alt.id}
                    disabled={state.size === 1 && state.has(alt.id ?? -1)}
                    checked={state.has(alt.id ?? -1)}
                    onChange={(e) => toggle([alt.id ?? 0, e.target.checked])}
                >
                    {alt.name}
                </Checkbox>
            )) || "No Alternatives"}
        </div>
    );
}
