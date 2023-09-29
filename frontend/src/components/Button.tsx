import {Observable} from "rxjs";
import React, {PropsWithChildren} from "react";
import {createSignal} from "@react-rxjs/utils";

export type Button = {
    click$: Observable<void>;
    component: (props: PropsWithChildren) => React.JSX.Element;
}

/**
 * Creates a button component and its associated click stream.
 */
export default function button(): Button {
    const [click$, click] = createSignal();

    return {
        click$: click$,
        component: ({children}: PropsWithChildren) => {
            //TODO: Add styling
            return <button className={""} onClick={click}>
                {children}
            </button>
        }
    }
}