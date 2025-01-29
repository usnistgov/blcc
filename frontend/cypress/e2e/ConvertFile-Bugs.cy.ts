describe("MILCON Non-energy:", () => {
    beforeEach(() => {  
        cy.visit("http://localhost:5173/editor");
    
        // Wait for page to fully load
        cy.contains("Project Name").should("exist");

        // Set file to open
        cy.get("#open").selectFile("cypress/e2e/old-blcc-files/MilconNon-Energy.xml", { force: true });

        // Check that the dialog exists
        cy.contains("Old Format Conversion").should("be.visible");

        // Close the dialog
        cy.contains("OK").click();
    });

    it("displays 50% for each year in phase in", () => {
        // Navigate to capital component page
        cy.contains("Renovate Building 172").click();
        cy.contains("Building Renovation").click();
        // Check value for year 1 under "Phase in (%)"
        const year1Ele = cy.contains("Phase In (%)").parent().next().children().should("contain", "50.00%");
        // Check value for year 2
        year1Ele.parent().next().children().should("contain", "50.00%");
    });

    it("displays -0.36% as the real discount rate", () => {
        cy.get("input[id='real-discount-rate']").should("have.value", "-0.36");
    });
});

describe("FederalFinanced:", () => {
    beforeEach(() => {  
        cy.visit("http://localhost:5173/editor");
    
        // Wait for page to fully load
        cy.contains("Project Name").should("exist");

        // Set file to open
        cy.get("#open").selectFile("cypress/e2e/old-blcc-files/FederalFinanced.xml", { force: true });

        // Check that the dialog exists
        cy.contains("Old Format Conversion").should("be.visible");

        // Close the dialog
        cy.contains("OK").click();
    });

    it("displays 4.24% as the nominal discount rate", () => {
        cy.get("input[id='nominal-discount-rate']").should("have.value", "4.24");
    });

    it("Lighting retrofit displays rate of change of -0.1%", () => {
        // Navigate to capital component page
        cy.contains("Lighting Retrofit").click();
        cy.contains("Annual Contract Payment").click();
        // Check vlaue
        cy.get("input[id='value-rate-of-change']").should("have.value", "-0.1");
    });

    it("displays CAF of 1.2%", () => {
        // Navigate to capital component page
        cy.contains("Existing").click();
        cy.contains("Existing System").click();
        // Check value
        cy.get("input[id='cost-adjustment-factor']").should("have.value", "1.2");
    });
})

describe("FEMP Energy:", () => {
    beforeEach(() => {  
        cy.visit("http://localhost:5173/editor");
    
        // Wait for page to fully load
        cy.contains("Project Name").should("exist");

        // Set file to open
        cy.get("#open").selectFile("cypress/e2e/old-blcc-files/FEMPEnergy.xml", { force: true });

        // Check that the dialog exists
        cy.contains("Old Format Conversion").should("be.visible");

        // Close the dialog
        cy.contains("OK").click();
    });

    it("uploads recurring information", () => {
        // Navigate to OMR page
        cy.contains("Existing System").click();
        cy.contains("Window AC Unit Routine Maintenance").click();
        // Check to see if "recurring" is checked
        cy.contains("Recurring").parent().next().should("have.attr", "aria-checked", "true");
    });

    it("displays 10% for residual value under window AC unit", () => {
        // Navigate to capital cost page
        cy.contains("Existing System").click();
        cy.contains("Window AC Unit").click();
        // Check value
        cy.get("input[id='residual-value']").should("have.value", "10");
    });

    it("uploads non-annual, non-capital replacement recurring costs as OMR", () => {
        // Navigate to main alternative page
        cy.contains("Existing System").click();
        // Check to see if "Window AC Unit Cleaning" is listed under OMR
        cy.contains("OMR").parent().next().children().contains("Window AC Unit Cleaning").should("exist");
    });
});