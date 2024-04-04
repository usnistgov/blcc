import { PropsWithChildren, useEffect } from "react";
import { Parser } from "html-to-react";
import "../nist-header-footer.sass";
import { bind } from "@react-rxjs/core";
import { from, mergeMap, shareReplay, switchMap } from "rxjs";
import { createSignal } from "@react-rxjs/utils";

const [getHeader$, getHeader] = createSignal();
const [getFooter$, getFooter] = createSignal();

// Loads the header
const [useHeader, header$] = bind(
    getHeader$.pipe(
        switchMap(() => from(fetch("https://pages.nist.gov/nist-header-footer/boilerplate-header.html"))),
        mergeMap((result) => result.text()),
        shareReplay(1)
    ),
    ""
);

// Loads the footer
const [useFooter] = bind(
    getFooter$.pipe(
        switchMap(() => from(fetch("https://pages.nist.gov/nist-header-footer/boilerplate-footer.html"))),
        mergeMap((result) => result.text()),
        shareReplay(1)
    ),
    ""
);

/**
 * Component to inject the NIST header and footer.
 * @param children
 */
export default function NistHeaderFooter({ children }: PropsWithChildren) {
    const header = useHeader();
    const footer = useFooter();

    useEffect(() => {
        getHeader();
        getFooter();
    }, []);

    return (
        <>
            <div className={"overflow-hidden rounded-t-lg"}>{Parser().parse(header)}</div>
            {children}
            <div className={"flex-grow"} />
            <div className={"overflow-hidden rounded-b-lg"}>{Parser().parse(footer)}</div>
        </>
    );
}
