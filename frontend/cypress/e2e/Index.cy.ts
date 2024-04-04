describe("Index Page Spec", () => {
    it("Should request header and footer", () => {
        cy.intercept({
            method: "GET",
            url: "https://pages.nist.gov/nist-header-footer/boilerplate-header.html"
        }).as("headerFooterRequest");

        cy.visit("http://localhost:8080");
        cy.wait("@headerFooterRequest");

        cy.get("header");
        cy.get("footer");
    });

    it("Opens the editor", () => {
        cy.visit("http://localhost:8080");
        cy.contains("Open BLCC").click();
        cy.url().should("include", "/editor");
    });
});
