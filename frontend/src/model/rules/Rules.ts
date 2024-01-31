import { Project } from "../../blcc-format/Format";

export type RuleResult = {
    value: boolean; // The result of the rule
    message: string; // A description of why the rule failed
};

export type RuleList = ((project: Project) => RuleResult)[];

export const rules: RuleList = [
    /**
     * Returns true if the project has a baseline alternative, otherwise false.
     */
    function hasBaseline(project: Project) {
        return {
            value: [...project.alternatives.values()].find((alt) => alt.baseline) !== undefined,
            message: "The project must have a baseline alternative."
        };
    }
];
