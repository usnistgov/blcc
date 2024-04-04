describe("General Information page", () => {
    it("Has Navigation", () => {
        cy.visit("http://localhost:8080/editor");
        cy.get("nav");
    });

    it("Can navigate to alternative summary page", () => {
        cy.visit("http://localhost:8080/editor");
        cy.get("nav").contains("Alternative Summary").click();
        cy.url().should("include", "/editor/alternative");
    });

    it("Has header", () => {
        cy.visit("http://localhost:8080/editor");
        cy.get("header");
    });

    it("Has footer", () => {
        cy.visit("http://localhost:8080/editor");
        cy.get("footer");
    });
});
