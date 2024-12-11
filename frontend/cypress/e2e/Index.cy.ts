describe("Index page spec", () => {
    it("should request header and footer", () => {
        cy.intercept({
            method: "GET",
            url: "https://pages.nist.gov/nist-header-footer/boilerplate-header.html",
        }).as("headerFooterRequest");

        cy.visit("http://localhost:5173");
        cy.wait("@headerFooterRequest");

        cy.get("header");
        cy.get("footer");
    });

    it("opens the editor", () => {
        cy.visit("http://localhost:5173");

        // Check that "Open BLCC" button exists
        const button = cy.get("button")
        button.should("exist");
        button.should("have.text", "Open BLCC");
        button.click()

        // Check that we actually navigated to the editor
        cy.url().should("include", "/editor")
    })
});
