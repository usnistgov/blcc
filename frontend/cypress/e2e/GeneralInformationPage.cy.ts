describe("General Information page", () => {
    it("Has Navigation", () => {
        cy.visit("http://localhost:8080/editor");
        cy.get("nav");
    });

    it("General Information Link is highlighted when active", () => {
        cy.visit("http://localhost:8080/editor");
        cy.get("nav").get("button").should("have.class", "bg-primary-light");
    });

    it("Can navigate to alternative summary page", () => {
        cy.visit("http://localhost:8080/editor");
        cy.get("nav").contains("Alternative Summary").click();
        cy.url().should("include", "/editor/alternative");
    });

    it("Can navigate to results page", () => {
        cy.visit("http://localhost:8080/editor");
        cy.get("header").contains("Reports and Analysis").click();
        cy.url().should("include", "/results");
    });

    it("Has header", () => {
        cy.visit("http://localhost:8080/editor");
        cy.get("header");
    });

    it("Has footer", () => {
        cy.visit("http://localhost:8080/editor");
        cy.get("footer");
    });

    it("Has project name input", () => {
        cy.visit("http://localhost:8080/editor");
        cy.contains("Project Name").next("input").type("Test Project");

        // Project Name in header is updated
        cy.get("header").contains("Test Project");
    });

    it("Has Analyst field", () => {
        cy.visit("http://localhost:8080/editor");
        cy.contains("Analyst").next("input").type("analyst");
    });

    it("Has Analysis Type dropdown", () => {
        cy.visit("http://localhost:8080/editor");
        cy.contains("Analysis Type").next().find("input");
        //TODO add more tests for dropdown
    });

    it("Has description field", () => {
        cy.visit("http://localhost:8080/editor");
        cy.contains("Description").next("textarea").type("Here is a description");
    });

    it("Has study period field", () => {
        cy.visit("http://localhost:8080/editor");
        cy.contains("Study Period").next().find("input").type("20");
    });
});
