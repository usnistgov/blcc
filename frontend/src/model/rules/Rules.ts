import { Project } from "../../blcc-format/Format";

export type RuleResult = {
    value: boolean;
    message: string;
};

export type RuleList = ((project: Project) => RuleResult)[];

export const rules: RuleList = [
    function hasBaseline(project: Project) {
        return {
            value: project.alternatives.find((alt) => alt.baseline) !== undefined,
            message: "The project must have a baseline alternative."
        };
    }
];
