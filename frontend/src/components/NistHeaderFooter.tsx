import { Parser } from "html-to-react";
import type { PropsWithChildren } from "react";
import "nist-header-footer.sass";
import { bind } from "@react-rxjs/core";
import { from, type Observable } from "rxjs";
import { parseHtml } from "util/Operators";
import { map } from "rxjs/operators";

/**
 * Model that controls downloading and parsing the NIST head and footer. We do this so we can inject it into the
 * HTML ourselves where we want it instead of relying on the builtin injector
 */
namespace Model {
    /**
     * The parser for the HTML fragments.
     * @private
     */
    const parser = Parser()

    /**
     * The two URL fragments to request.
     */
    enum Fragment {
     HEADER = "header",
     FOOTER = "footer"
    }

    /**
     * Creates an observable that fetches and parses the HTML fragments.
     * @param fragment the URL fragment to download.
     * @private
     */
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    function parse(fragment: Fragment): Observable<any> {
        return from(fetch(`https://pages.nist.gov/nist-header-footer/boilerplate-${fragment}.html`)).pipe(
            parseHtml(),
            map(html => parser.parse(html))
        )
    }

    /**
     * A hook that returns the NIST header fragment.
     */
    export const [useHeader] = bind(parse(Fragment.HEADER))

    /**
     * A hook that returns the NIST footer fragment.
     */
    export const [useFooter] = bind(parse(Fragment.FOOTER))
}

/**
 * Component to inject the NIST header and footer.
 * @param children
 */
export default function NistHeaderFooter({ children }: PropsWithChildren) {
    return (
        <>
            <div className={"overflow-hidden rounded-t-lg"}>{Model.useHeader()}</div>
            {children}
            <div className={"flex-grow"} />
            <div className={"overflow-hidden rounded-b-lg"}>{Model.useFooter()}</div>
        </>
    );
}
