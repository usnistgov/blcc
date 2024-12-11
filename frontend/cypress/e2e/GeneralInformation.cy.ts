import { AnalysisType } from "blcc-format/Format";

describe("General Information page", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5173/editor");
    });

    it("should display the correct page title", () => {
        cy.title().should("eq", "BLCC");
    });

    describe("has an app bar that", () => {
        it("has the user guide button to download user guide pdf", () => {
            cy.contains("User Guide").parents("a").should("have.attr", "href");
        });
    });

    describe("has a nav bar that", () => {
        it("can navigate to alternative summary page", () => {
            cy.contains("Alternative Summary").click();
            cy.url().should("include", "/alternative");
        });
    });

    describe("have project name field that", () => {
        it("should contain a text field for the project name", () => {
            cy.get("input[name='projectName']").should("exist");
        });

        it("should display default project name if field is empty", () => {
            // Reset project name
            cy.get("input[name='projectName']").clear();

            // Check that the default project name is displayed
            cy.get("#project-name").should("have.text", "Untitled Project");
        });

        it("changes the project name in appbar", () => {
            // Get the project name field
            const projectNameField = cy.get("input[name='projectName']");

            // Enter a new project name
            const newProjectName = "New Project Name";
            projectNameField.clear().type(newProjectName);

            // Check that the project name in the appbar is updated
            cy.get("#project-name").should("have.text", newProjectName);
        });
    });

    describe("has a text area for project description that", () => {
        it("exists", () => {
            cy.get("textarea[name='description']").should("exist");
        });

        it("can be empty", () => {
            // Get input field
            const descriptionInput = cy.get("textarea[name='description']");
            descriptionInput.clear();

            // Check that the input field is empty
            descriptionInput.should("have.value", "");
        });

        it("can be filled", () => {
            // Get input field
            const descriptionInput = cy.get("textarea[name='description']");

            // Enter a value
            const newValue = "This is a new project description.";
            descriptionInput.clear().type(newValue);

            // Check that the input field is filled
            descriptionInput.should("have.value", newValue);
        });
    });

    describe("has a text field for analyst that", () => {
        it("exists", () => {
            cy.get("input[name='analyst']").should("exist");
        });

        it("can be empty", () => {
            // Get input field
            const analystInput = cy.get("input[name='analyst']");
            analystInput.clear();

            // Check that the input field is empty
            analystInput.should("have.value", "");
        });

        it("can be filled", () => {
            // Get input field
            const analystInput = cy.get("input[name='analyst']");

            // Enter a value
            const newValue = "John Doe";
            analystInput.clear().type(newValue);

            // Check that the input field is filled
            analystInput.should("have.value", newValue);
        });
    });

    describe("has a drop down for project type that", () => {
        it("exists", () => {
            cy.get("input[id='analysisType']").should("exist");
        });

        it("can be selected", () => {
            // Get analysis type select
            const analysisTypeSelect = cy.get("input[id='analysisType']").parent().parent();

            // Select a value
            analysisTypeSelect.click();
            cy.get("#analysisType_list").siblings("div").contains(AnalysisType.FEMP_ENERGY).click({ force: true });

            // Check that the value is selected
            cy.get("input[id='analysisType']").parent().siblings("span").should("have.text", AnalysisType.FEMP_ENERGY);
        });

        it("should open analysis purpose when on AnalysisType.OMB_NON_ENERGY", () => {
            // Get analysis type select
            const analysisTypeSelect = cy.get("input[id='analysisType']").parent().parent();

            // Select a value
            analysisTypeSelect.click();
            cy.get("#analysisType_list").siblings("div").contains(AnalysisType.OMB_NON_ENERGY).click({ force: true });

            // Check that the value is selected
            cy.get("input[id='analysisType']")
                .parent()
                .siblings("span")
                .should("have.text", AnalysisType.OMB_NON_ENERGY);

            // Check that the project purpose is displayed
            cy.get("input[id='analysisPurpose']").should("exist");
        });

        it("should not display analysis purpose for another other AnalysisType", () => {
            // Get analysis type select
            const analysisTypeSelect = cy.get("input[id='analysisType']").parent().parent();

            // Loop through each analysis type
            for (const analysisType of Object.values(AnalysisType)) {
                if (analysisType === AnalysisType.OMB_NON_ENERGY) continue;

                // Select a value
                analysisTypeSelect.click();
                cy.get("#analysisType_list").siblings("div").contains(analysisType).click({ force: true });

                // Check that the value is selected
                cy.get("input[id='analysisType']").parent().siblings("span").should("have.text", analysisType);
                // Check that the project purpose is not displayed
                cy.get("input[id='analysisPurpose']").should("not.exist");
            }
        });
    });

    describe("has a study period field that", () => {
        it("exists", () => {
            cy.get("input[name='studyPeriod']").should("exist");
        });

        it("can be changed", () => {
            // Get input field
            const studyPeriodInput = cy.get("input[name='studyPeriod']");

            // Enter a value
            const newValue = 10;
            studyPeriodInput.clear().type(newValue.toString());

            // Check that the input field is filled
            studyPeriodInput.should("have.value", newValue);
        })
    })
});
