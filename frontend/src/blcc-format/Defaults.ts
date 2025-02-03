import type { ID } from "blcc-format/Format";

export namespace Defaults {
    export const STUDY_PERIOD: number = 40;
    export const CONSTRUCTION_PERIOD: number = 3;

    /*
     * This is the first year for which we have data, so it is the default in case something goes wrong in fetching
     * the release years.
     */
    export const RELEASE_YEAR: number = 2023;

    // Represents an invalid ID that no object should ever have.
    export const INVALID_ID: ID = -1;

    // The ID of the project in the database.
    export const PROJECT_ID: ID = 1;
}
