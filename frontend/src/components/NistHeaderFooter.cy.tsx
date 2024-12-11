import React from "react";
import NistHeaderFooter from "./NistHeaderFooter";
import { Subscribe } from "@react-rxjs/core";

describe("<NistHeaderFooter />", () => {
    it("renders", () => {
        cy.mount(
            <Subscribe>
                <NistHeaderFooter>
                    <div>Foo</div>
                </NistHeaderFooter>
            </Subscribe>,
        );
    });

    it("requests the header and footer html", () => {
        cy.intercept({
            method: "GET",
            url: "https://pages.nist.gov/nist-header-footer/boilerplate-header.html",
        }).as("headerRequest");
        cy.intercept({
            method: "GET",
            url: "https://pages.nist.gov/nist-header-footer/boilerplate-footer.html",
        }).as("footerRequest");

        cy.mount(
            <Subscribe>
                <NistHeaderFooter>
                    <div>Bar</div>
                </NistHeaderFooter>
            </Subscribe>,
        );

        cy.wait("@headerRequest");
        cy.wait("@footerRequest");
    });
});
