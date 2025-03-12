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
    sToggle$?: Subject<ID>;
    wire?: Subject<Set<ID>>;
};

/**
 * Displays a list of all alternatives as checkboxes for when a cost needs to be applied to specific alts. Can either
 * handle its own state or accept a list of alternatives to display as initial values.
 */
export default function AppliedCheckboxes({ defaults, value$, wire, sToggle$ }: AppliedCheckboxesProps) {
    const [internalState, state$, toggle, toggle$] = useMemo(() => {
        const [toggle$, toggle] = createSignal<ID>();
        const [internalState, state$] = bind(
            iif(
                () => value$ === undefined,
                toggle$.pipe(gatherSet(...(defaults ?? [])), startWith(new Set(defaults))),
                value$ ?? EMPTY,
            ),
            new Set(),
        );

        return [internalState, state$, toggle, toggle$];
    }, [defaults, value$]);

    // Hook up output streams
    useSubscribe(state$, wire);
    useSubscribe(toggle$, sToggle$);

    const alternatives = useAlternatives();
    const state = internalState();

    return (
        <div className={"grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-md border bg-white p-2 shadow"}>
            {alternatives.map((alt) => (
                <Checkbox
                    key={alt.id}
                    disabled={state.size === 1 && state.has(alt.id ?? -1)}
                    checked={state.has(alt.id ?? -1)}
                    onChange={() => toggle(alt.id ?? 0)}
                >
                    {alt.name}
                </Checkbox>
            )) || "No Alternatives"}
        </div>
    );
}
