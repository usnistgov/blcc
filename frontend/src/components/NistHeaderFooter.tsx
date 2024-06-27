import { Parser } from "html-to-react";
import { type PropsWithChildren, useEffect } from "react";
import "nist-header-footer.sass";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { from, switchMap } from "rxjs";
import { parseHtml } from "util/Operators";

const [getHeader$, getHeader] = createSignal();
const [getFooter$, getFooter] = createSignal();

// Loads the header
const [useHeader] = bind(
    getHeader$.pipe(
        switchMap(() => from(fetch("https://pages.nist.gov/nist-header-footer/boilerplate-header.html"))),
        parseHtml(),
    ),
    "",
);

// Loads the footer
const [useFooter] = bind(
    getFooter$.pipe(
        switchMap(() => from(fetch("https://pages.nist.gov/nist-header-footer/boilerplate-footer.html"))),
        parseHtml(),
    ),
    "",
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
