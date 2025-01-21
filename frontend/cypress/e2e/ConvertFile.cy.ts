import { AnalysisType, Purpose } from "blcc-format/Format";

describe("Clicking the open button", () => {
    describe("opens a confirmation dialog that", () => {
        beforeEach(() => {
            cy.visit("http://localhost:5173/editor/");

            // Wait for page to fully load using exist statement
            cy.contains("Project Name").should("exist");

            /* Change project name to guarantee triggering "Discard Changes" dialog */
            // Get project name field
            const projectNameField = cy.get("input[name='projectName']");

            // Enter a new project name
            const newProjectName = "New Project Name";
            projectNameField.clear().type(newProjectName);
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
            cy.get("#open").selectFile("cypress/e2e/old-blcc-files/MilconFEMP.xml", { force: true });

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
            cy.url().should("eq", "http://localhost:5173/editor/");
        });
    });

    describe("converts the general information of old blcc files properly", () => {
        const projectName = "OMB Demo";
        const projectDesc = "Lease vs. Buy Decision";
        const analystName = "SKF"
        const analysisType = AnalysisType.OMB_NON_ENERGY;
        const analysisPurpose = Purpose.COST_LEASE;
        const studyPeriod = "15";
        const constructionPeriod = "0";
        const discountingConvention = "Mid Year";
        const country = "United States of America";
        const state = "MD";
        const discountRate = "-0.008";

        beforeEach(() => {
            cy.visit("http://localhost:5173/editor");

            // Wait for page to fully load
            cy.contains("Project Name").should("exist");

            // Set file to open
            cy.get("#open").selectFile("cypress/e2e/old-blcc-files/OMBNon-Energy.xml", { force: true });

            // Check that the dialog exists
            cy.contains("Old Format Conversion").should("exist");

            // Close the dialog
            cy.contains("OK").click();
        });

        it("populates project name correctly", () => {
            cy.contains("Project Name").should("exist");
            cy.get("#project-name").should("have.text", projectName);
        });

        it("populates project description correctly", () => {
            // Get input field
            const descriptionInput = cy.get("textarea[name='description']");
            // Check  if it was populated correctly
            descriptionInput.should("have.value", projectDesc);
        });

        it("populates analyst name correctly", () => {
            // Get input field
            const analystInput = cy.get("input[name='analyst']").should("exist");
            // Check input
            analystInput.should("have.value", analystName);
        });

        it("populates analysis type correctly", () => {
            // Get analysis type
            const analysisTypeSelect = cy.get("input[id='analysisType']").should("exist");
            // Check if it was populated correctly
            analysisTypeSelect.parent().siblings("span").should("have.text", analysisType);
        });

        it("populates analysis purpose correctly", () => {
            // Check that the project purpose is displayed
            const analysisPurposeSelect = cy.get("input[id='analysisPurpose']").should("exist");

            // Check that the project purpose is populated correctly
            analysisPurposeSelect.parent().siblings("span").should("have.text", analysisPurpose);
        });

        it("populates study period correctly", () => {
            const studyPeriodSelect = cy.get("input[name='studyPeriod'").should("exist");

            studyPeriodSelect.should("have.value", studyPeriod);
        });

        it("populates construction period correctly", () => {
            const constructionPeriodSelect = cy.get("input[name='constructionPeriod'").should("exist");

            constructionPeriodSelect.should("have.value", constructionPeriod);
        });

        it("populates discounting convention correctly", () => {
            cy.contains(discountingConvention).should("exist");
        });

        it("populates country correctly", () => {
            cy.contains(country).should("exist");
        });

        it("populates state correctly", () => {
            cy.contains(state).should("exist");
        });

        it("populates real discount rate correctly", () => {
            const discountRateSelect = cy.contains("Real Discount Rate").parent().siblings().children().children().children().children();
            discountRateSelect.should("have.value", discountRate);
        });
    });
});