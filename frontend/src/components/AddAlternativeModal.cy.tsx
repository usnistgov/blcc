import { mount } from "cypress/react18";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { of } from "rxjs";
import AddAlternativeModal from "./AddAlternativeModal";

Cypress.Commands.add("mount", (component, options = {}) => {
    const { routerProps = { initialEntries: ["/"] }, ...mountOptions } = options;
    const wrapped = <MemoryRouter {...routerProps}>{component}</MemoryRouter>;
    return mount(wrapped, mountOptions);
});

describe("<AddAlternativeModal />", () => {
    it("renders", () => {
        // see: https://on.cypress.io/mounting-react
        cy.mount(<AddAlternativeModal open$={of(true)} />);
    });
});
