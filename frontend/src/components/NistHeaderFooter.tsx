import { Parser } from "html-to-react";
import { type PropsWithChildren, useEffect, useMemo } from "react";
import "nist-header-footer.sass";
import { bind } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import { from, switchMap } from "rxjs";
import { tap } from "rxjs/operators";
import { parseHtml } from "util/Operators";

/**
 * Component to inject the NIST header and footer.
 * @param children
 */
export default function NistHeaderFooter({ children }: PropsWithChildren) {
    const [useHeader, useFooter] = useMemo(() => {
        // Loads the header
        const [useHeader] = bind(
            from(fetch("https://pages.nist.gov/nist-header-footer/boilerplate-header.html")).pipe(parseHtml()),
            "",
        );

        // Loads the footer
        const [useFooter] = bind(
            from(fetch("https://pages.nist.gov/nist-header-footer/boilerplate-footer.html")).pipe(
                parseHtml(),
                tap(() => console.log("called get footer")),
            ),
            "",
        );

        return [useHeader, useFooter];
    }, []);

    const header = useHeader();
    const footer = useFooter();

    return (
        <>
            <div className={"overflow-hidden rounded-t-lg"}>{Parser().parse(header)}</div>
            {children}
            <div className={"flex-grow"} />
            <div className={"overflow-hidden rounded-b-lg"}>{Parser().parse(footer)}</div>
        </>
    );
}
