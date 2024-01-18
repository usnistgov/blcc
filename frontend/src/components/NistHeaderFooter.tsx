import { PropsWithChildren } from "react";
import { Parser } from "html-to-react";
import "../nist-header-footer.sass";
import { bind } from "@react-rxjs/core";
import { from, mergeMap, shareReplay } from "rxjs";

const [useHeader] = bind(
    from(fetch("https://pages.nist.gov/nist-header-footer/boilerplate-header.html")).pipe(
        mergeMap((result) => result.text()),
        shareReplay(1)
    ),
    ""
);

const [useFooter] = bind(
    from(fetch("https://pages.nist.gov/nist-header-footer/boilerplate-footer.html")).pipe(
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
    return (
        <>
            <div className={"overflow-hidden rounded-t-lg"}>{Parser().parse(useHeader())}</div>
            {children}
            <div className={"flex-grow"} />
            <div className={"overflow-hidden rounded-b-lg"}>{Parser().parse(useFooter())}</div>
        </>
    );
}
