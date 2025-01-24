describe("populate each capital component", () => {
    const alternative1Name = "Existing";;
    const alternative1Desc = `Base Case: Keep existing system for remaining 15 years of its useful life.`;
    const alternative2Name = "Lighting Retrofit";
    const capitalComponentName = "Existing System";
    const capitalComponentDesc = `Keep existing system for the remaining 15 years of its useful life.`;
    const capitalComponentRecurringName = "cost";
    const capitalComponentLifetime = "15";
    const capitalComponentRecurringAmount = "5600";

    beforeEach(() => {       
        cy.visit("http://localhost:5173/editor");

        // Wait for page to fully load
        cy.contains("Project Name").should("exist");
        
        // Set file to open
        cy.get("#open").selectFile("cypress/e2e/old-blcc-files/FederalFinanced.xml", { force: true });

        // Check that the dialog exists
        cy.contains("Old Format Conversion").should("exist");

        // Close the dialog
        cy.contains("OK").click();
    })
    
    it("populates on first sidebar", () => {
        cy.contains(alternative1Name).should("exist");
        cy.contains(alternative2Name).should("exist");
    });

    it("populates on second sidebar", () => {
        // Click on alternative to open second sidebar
        cy.contains(alternative1Name).click();
        // Check for both the capital component and its recurring cost
        cy.contains(capitalComponentName).should("exist");
        cy.contains(capitalComponentName + " " + capitalComponentRecurringName).should("exist");
    });

    it("populates alternative name correctly on the main page", () => {
        // Navigate to main alternative page
        cy.contains(alternative1Name).click();
        // Check value under "Name"
        cy.contains("Name").siblings().should("have.value", alternative1Name);
    });

    it("populates alternative description correctly on the main page", () => {
        // Navigate to main alternative page
        cy.contains(alternative1Name).click();
        // Check to make sure description is populated under "Description"
        cy.contains("Description").siblings().contains(alternative1Desc).should("exist");
    });

    describe("populates capital component correctly", () => {
        beforeEach(() => {
            // Navigate to the capital component page
            cy.contains(alternative1Name).click();
            cy.contains(capitalComponentName).click();
        })

        it("populates capital component name correctly", () => {
            // Ensure the name is under "Name" 
            cy.contains("Name").siblings().should("have.value", capitalComponentName)
        });

        it("populates capital component description correctly", () => {
            // Ensure the description is under "Description"
            cy.contains("Description").siblings().contains(capitalComponentDesc).should("exist");
        });

        it("populates expected lifetime correctly", () => {
            // Get input field for expected lifetime
            const expectedLifetimeSelect = cy.get("input[id='expected-lifetime']").should("exist");
            // Check value
            expectedLifetimeSelect.should("have.value", capitalComponentLifetime);
        });
    });

    describe("populate recurring component correctly", () => {
        beforeEach(() => {
            // Navigate to recurring component page
            cy.contains(alternative1Name).click();
            cy.contains(capitalComponentName + " " + capitalComponentRecurringName).click();
        })

        it("populates recurring component name correctly", () => {
            // Check name field for accuracy
            cy.contains("Name").siblings().should("have.value", capitalComponentName + " " + capitalComponentRecurringName);
        })

        it("populates recurring cost correctly", () => {
            // Check initial cost field for accuracy
            cy.get("input[id='initial-cost']").should("have.value",capitalComponentRecurringAmount);
        })
    });
});