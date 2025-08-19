import { Parser } from "html-to-react";
import type { PropsWithChildren } from "react";
import "nist-header-footer.sass";
import { bind } from "@react-rxjs/core";
import { from, type Observable } from "rxjs";
import { parseHtml } from "util/Operators";
import { map } from "rxjs/operators";
import NistLogo from "images/nist_logo_brand_black.svg?react";

/**
 * Model that controls downloading and parsing the NIST head and footer. We do this so we can inject it into the
 * HTML ourselves where we want it instead of relying on the builtin injector
 */
namespace Model {
    /**
     * The parser for the HTML fragments.
     * @private
     */
    const parser = Parser();

    /**
     * The two URL fragments to request.
     */
    enum Fragment {
        HEADER = "header",
        FOOTER = "footer",
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
            map((html) => parser.parse(html)),
        );
    }

    /**
     * A hook that returns the NIST header fragment.
     */
    export const [useHeader] = bind(parse(Fragment.HEADER));

    /**
     * A hook that returns the NIST footer fragment.
     */
    export const [useFooter] = bind(parse(Fragment.FOOTER));
}

export function NistHeader({ rounded = true }: { rounded?: boolean }) {
    return <div className={`overflow-hidden ${rounded ? "rounded-t-lg" : ""}`}>{Model.useHeader()}</div>;
}

export function NistFooter({
    rounded = true,
    white,
    extraWhiteBackground,
}: { rounded?: boolean; white?: boolean; extraWhiteBackground?: boolean }) {
    return (
        <div className={`overflow-hidden ${rounded ? "rounded-t-lg" : ""}`}>
            <footer
                className={`nist-footer ${white ? "nist-footer-whitetext" : "nist-footer-blacktext"}`}
                style={{ backgroundColor: `${white ? "#333333" : extraWhiteBackground ? "#FFFFFF" : "#FAFAFA"}` }}
            >
                <div className="nist-footer__inner">
                    {/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
                    <div className="nist-footer__menu" role="navigation">
                        <ul>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.nist.gov/privacy-policy">Site Privacy</a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.nist.gov/oism/accessibility">Accessibility</a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.nist.gov/privacy">Privacy Program</a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.nist.gov/oism/copyrights">Copyrights</a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.commerce.gov/vulnerability-disclosure-policy">
                                    Vulnerability Disclosure
                                </a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.nist.gov/no-fear-act-policy">No Fear Act Policy</a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.nist.gov/foia">FOIA</a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.nist.gov/environmental-policy-statement">Environmental Policy</a>
                            </li>
                            <li className="nist-footer__menu-item ">
                                <a href="https://www.nist.gov/summary-report-scientific-integrity">
                                    Scientific Integrity
                                </a>
                            </li>
                            <li className="nist-footer__menu-item ">
                                <a href="https://www.nist.gov/nist-information-quality-standards">
                                    Information Quality Standards
                                </a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.commerce.gov/">Commerce.gov</a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.science.gov/">Science.gov</a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://www.usa.gov/">USA.gov</a>
                            </li>
                            <li className="nist-footer__menu-item">
                                <a href="https://vote.gov/">Vote.gov</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="nist-footer__logo">
                    <a
                        href="https://www.nist.gov/"
                        title="National Institute of Standards and Technology"
                        className="nist-footer__logo-link"
                        rel="home"
                    >
                        <NistLogo className={`w-96 h-fit ${white ? "fill-white" : "fill-black"}`} />
                    </a>
                </div>
            </footer>
        </div>
    );
}

/**
 * Component to inject the NIST header and footer.
 * @param children
 */
export default function NistHeaderFooter({
    rounded = true,
    whiteFooter = true,
    children,
}: { rounded?: boolean; whiteFooter?: boolean } & PropsWithChildren) {
    return (
        <>
            <NistHeader rounded={rounded} />
            {children}
            <div className={"flex-grow"} />
            <NistFooter white={whiteFooter} rounded={rounded} />
        </>
    );
}
