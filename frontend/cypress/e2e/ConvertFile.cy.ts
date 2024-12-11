describe("Clicking the open button", () => {
    describe("opens a confirmation dialog that", () => {
        beforeEach(() => {
            cy.visit("http://localhost:5173/editor/alternative");
            cy.wait(200);
        });

        it("exists", () => {
            cy.contains("Open").click();

            // Check that the dialog exists
            cy.contains("Delete Existing Project Without Saving?").should("exist");
        });

        it("can be dismissed", () => {
            cy.contains("Open").click();

            // Dismiss the dialog
            cy.contains("Cancel").click();
            cy.contains("Delete Existing Project Without Saving?").should("not.be.visible");
        });

        it("shows old file conversion dialog", () => {
            // Set file to open
            cy.get("#open").selectFile("cypress/e2e/old-blcc-files/FEMPEnergy.xml", { force: true });

            // Open confirmation dialog
            cy.contains("Open").click();
            cy.contains("Discard Changes").click({ force: true });

            // Check that the dialog exists
            cy.contains("Old Format Conversion").should("be.visible");

            // Close the dialog
            cy.contains("OK").click();
            cy.contains("Old Format Conversion").should("not.be.visible");
        });

        it("navigates to general information page", () => {
            // Set file to open
            cy.get("#open").selectFile("cypress/e2e/old-blcc-files/FEMPEnergy.xml", { force: true });

            // Open confirmation dialog
            cy.contains("Open").click();
            cy.contains("Discard Changes").click({ force: true });

            // Close the dialog
            cy.contains("OK").click();
            cy.contains("Old Format Conversion").should("not.be.visible");

            // Check that the dialog exists
            cy.url().should("eq", "http://localhost:5173/editor");
        });
    });

    describe("converts old blcc files properly", () => {
        beforeEach(() => {
            cy.visit("http://localhost:5173/editor");
            cy.wait(200);

            // Set file to open
            cy.get("#open").selectFile("cypress/e2e/old-blcc-files/FEMPEnergy.xml", { force: true });
        });
    });
});
