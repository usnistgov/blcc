import { createSignal } from "@react-rxjs/utils";
import { Divider, Radio } from "antd";
import Title from "antd/es/typography/Title";
import {
    AnalysisType,
    type Cost,
    CostTypes,
    DiscountingMethod,
    DollarMethod,
    type ERCIPCost,
    Purpose,
} from "blcc-format/Format";
import Info from "components/Info";
import Location from "components/Location";
import { NistFooter } from "components/NistHeaderFooter";
import { Button } from "components/input/Button";
import { TestInput } from "components/input/TestInput";
import { TestNumberInput } from "components/input/TestNumberInput";
import { TestSelect } from "components/input/TestSelect";
import { TestTextArea } from "components/input/TestTextArea";
import ERCIPALtModal, { ERCIPAltModel } from "components/modal/ERCIPAltModal";
import UpdateGeneralOptionsModal from "components/modal/UpdateGeneralOptionsModal";
import { Strings } from "constants/Strings";
import { motion } from "framer-motion";
import { useSubscribe } from "hooks/UseSubscribe";
import { currentProject$, ercipBaseCase$, ercipCosts$, Model, sProject$ } from "model/Model";
import { db } from "model/db";
import DiscountRates from "pages/editor/general_information/DiscountRates";
import { EiaProjectScenarioSelect } from "pages/editor/general_information/EiaProjectScenarioSelect";
import GhgInput from "pages/editor/general_information/GhgInput";
import { map, tap, withLatestFrom } from "rxjs";

const [createBaseCase$, createBaseCase] = createSignal<void>();
const [ercipTurnedOff, turnOffERCIP] = createSignal<void>();

/**
 * Creates a new alternative in the DB and returns the new ID.
 * @param projectID the ID of the project to create the alternative for.
 * @param name the name of the new alternative.
 */
function turnOnERCIP(projectID: number): Promise<number> {
    return db.transaction("rw", db.costs, db.alternatives, db.projects, async () => {
        // Add base case alternative and get its ID
        const newAltID = await db.alternatives.add({
            name: "Base Cost",
            costs: [],
            ERCIPBaseCase: true,
            baseline: true,
        });

        // Add alternative ID to current project
        await db.projects
            .where("id")
            .equals(projectID)
            .modify((project) => {
                project.alternatives.push(newAltID);
            });

        // Add a new ERCIP cost for every alternative
        for (const alt of await db.alternatives.toArray()) {
            const newCost = {
                name: "ERCIP",
                type: CostTypes.ERCIP,
                constructionCost: 0,
                SIOH: 0,
                designCost: 0,
                salvageValue: 0,
                publicUtilityRebate: 0,
                cybersecurity: 0,
            } as ERCIPCost;

            // Add new cost to DB and get new ID
            const baseCaseCostID = await db.costs.add(newCost);

            // Add new cost ID to project
            await db.projects
                .where("id")
                .equals(projectID ?? 1)
                .modify((project) => {
                    project.costs.push(baseCaseCostID);
                });

            // Add new cost ID to alternatives
            await db.alternatives
                .where("id")
                .equals(alt.id ?? 0)
                .modify((alt) => {
                    alt.costs.push(baseCaseCostID);
                });

            // Disable base case for non-base case
            if (alt.name !== "Base Cost" && alt.baseline === true) {
                db.alternatives.put({ ...alt, baseline: false });
            }
        }

        return newAltID;
    });
}

function removeERCIPBaseAlternative([projectID, alternativeID]: [number, number]) {
    return db.transaction("rw", db.alternatives, db.projects, db.costs, async () => {
        // Remove costs only associated with this alternative
        for (const costID of (await db.alternatives.where("id").equals(alternativeID).toArray()).flatMap(
            (alt) => alt.costs,
        )) {
            // Delete if it belongs to only one alternative
            if ((await db.alternatives.toArray()).filter((alt) => alt.costs.includes(costID)).length <= 1) {
                db.costs.where("id").equals(costID).delete();
            }
        }

        // Remove alternative
        db.alternatives.where("id").equals(alternativeID).delete();

        // Remove alternative ID from project
        db.projects
            .where("id")
            .equals(projectID)
            .modify((project) => {
                const index = project.alternatives.indexOf(alternativeID);
                if (index > -1) {
                    project.alternatives.splice(index, 1);
                }
            });
    });
}

function removeERCIPCosts([projectID, costs]: [number, ERCIPCost[]]) {
    return db.transaction("rw", db.costs, db.alternatives, db.projects, async () => {
        // Delete cost
        for (const costID of costs.map((cost) => cost.id)) {
            db.costs.where("id").equals(costID).delete();

            // Remove cost from all associated alternatives
            db.alternatives
                .filter((alternative) => alternative.costs.includes(costID))
                .modify((alternative) => {
                    const index = alternative.costs.indexOf(costID);
                    if (index > -1) {
                        alternative.costs.splice(index, 1);
                    }
                });

            // Remove cost from project
            db.projects
                .where("id")
                .equals(projectID)
                .modify((project) => {
                    const index = project.costs.indexOf(costID);
                    if (index > -1) {
                        project.costs.splice(index, 1);
                    }
                });
        }
    });
}

/**
 * Returns a dropdown for selecting the analysis purpose if the analysis type is OMB Non-Energy,
 * otherwise returns nothing.
 *
 * @returns A dropdown with options for selecting the analysis purpose.
 */
function AnalysisPurpose() {
    if (Model.analysisType.use() !== AnalysisType.OMB_NON_ENERGY) return;

    return (
        <TestSelect
            className={"w-full"}
            label={"Analysis Purpose"}
            id={"analysisPurpose"}
            placeholder={"Select Analysis Purpose"}
            info={Strings.ANALYSIS_PURPOSE}
            options={Object.values(Purpose)}
            getter={Model.purpose.use}
            required
            onChange={(change) => Model.purpose.set(change)}
            error={Model.purpose.useValidation}
        />
    );
}

export default function GeneralInformation() {
    useSubscribe(Model.updateAnalysisType$);

    useSubscribe(
        createBaseCase$.pipe(
            withLatestFrom(currentProject$),
            map((click, projectId) => projectId),
        ),
        turnOnERCIP,
    );

    useSubscribe(
        ercipTurnedOff.pipe(
            withLatestFrom(currentProject$, ercipBaseCase$),
            map(([click, projectId, ercipBaseCase]) => [projectId, ercipBaseCase?.id] as [number, number]),
        ),
        removeERCIPBaseAlternative,
    );

    useSubscribe(
        ercipTurnedOff.pipe(
            withLatestFrom(currentProject$, ercipCosts$),
            map(([, projectId, ercipCosts]) => [projectId, ercipCosts] as [number, ERCIPCost[]]),
        ),
        removeERCIPCosts,
    );

    return (
        <motion.div
            className={"h-full w-full overflow-y-auto"}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.08 }}
        >
            <UpdateGeneralOptionsModal />
            <ERCIPALtModal />

            <div className="flex flex-col justify-between h-full">
                <div className={"mb-16 max-w-screen-lg p-6"}>
                    <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                        {/* Project Name */}
                        <TestInput
                            id={"general-information:project-name"}
                            name={"projectName"}
                            label={"Project Name"}
                            info={Strings.PROJECT_NAME}
                            required
                            placeholder={"Untitled Project"}
                            getter={Model.name.use}
                            onChange={(event) => {
                                const change = event.currentTarget.value;
                                Model.name.set(change === "" ? undefined : change);
                            }}
                            showCount
                            maxLength={45}
                            error={Model.name.useValidation}
                        />

                        {/* Analyst */}
                        <TestInput
                            name={"analyst"}
                            label={"Analyst"}
                            info={Strings.ANALYST}
                            getter={Model.analyst.use}
                            onChange={(event) => {
                                const change = event.currentTarget.value;
                                Model.analyst.set(change === "" ? undefined : change);
                            }}
                            showCount
                            maxLength={30}
                            error={Model.analyst.useValidation}
                        />

                        {/* Analysis Type */}
                        <TestSelect
                            className={"w-full"}
                            label={"Analysis Type"}
                            id={"analysisType"}
                            info={Strings.ANALYSIS_TYPE}
                            required
                            placeholder={"Please select an analysis type"}
                            options={Object.values(AnalysisType)}
                            getter={Model.analysisType.use}
                            error={Model.analysisType.useValidation}
                            onChange={(change) => {
                                Model.analysisType.set(change);

                                if (change !== AnalysisType.MILCON_ECIP) turnOffERCIP();
                                if (change === AnalysisType.MILCON_ECIP) createBaseCase();

                                if (change !== AnalysisType.OMB_NON_ENERGY) Model.purpose.set(undefined);
                            }}
                        />

                        {/* Analysis Purpose */}
                        <AnalysisPurpose />

                        {/* Description */}
                        <span className={"col-span-2 mb-3"}>
                            <TestTextArea
                                name={"description"}
                                label={"Description"}
                                className={"w-full"}
                                info={Strings.DESCRIPTION}
                                getter={Model.description.use}
                                showCount
                                maxLength={300}
                                onChange={(event) => Model.description.set(event.currentTarget.value)}
                            />
                        </span>
                        <div className={"col-span-2 grid grid-cols-4 gap-x-16 gap-y-4"}>
                            <TestNumberInput
                                className={"w-full"}
                                getter={Model.studyPeriod.use}
                                label={"Study Period"}
                                name={"studyPeriod"}
                                required
                                min={1}
                                error={Model.studyPeriod.useValidation}
                                info={Strings.STUDY_PERIOD}
                                onChange={(event) => {
                                    Model.studyPeriod.set(event ?? undefined);
                                }}
                            />
                            <TestNumberInput
                                className={"w-full"}
                                required
                                getter={Model.constructionPeriod.use}
                                label={"Construction Period"}
                                name={"constructionPeriod"}
                                min={0}
                                error={Model.constructionPeriod.useValidation}
                                info={Strings.CONSTRUCTION_PERIOD}
                                onChange={(event) => Model.constructionPeriod.set(event ?? 0)}
                            />
                            <TestSelect
                                className={"w-full"}
                                label={"Data Release Year"}
                                info={Strings.DATA_RELEASE_YEAR}
                                optionGetter={Model.useReleaseYearList}
                                getter={Model.releaseYear.use}
                                onChange={(releaseYear) => Model.releaseYear.set(releaseYear)}
                            />
                            <EiaProjectScenarioSelect />
                        </div>
                    </div>
                    <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                        <div className={"grid grid-cols-2 gap-x-8 gap-y-2"}>
                            <Divider
                                className={"col-span-2 h-fit"}
                                style={{ fontSize: "20px" }}
                                orientation={"left"}
                                orientationMargin={"0"}
                            >
                                <Info text={Strings.DISCOUNTING}>Discounting</Info>
                            </Divider>
                            <div>
                                <Title level={5}>
                                    <Info text={Strings.DOLLAR_ANALYSIS}>
                                        Constant/Current
                                        <br />
                                        Dollar Analysis
                                    </Info>
                                </Title>
                                <Radio.Group
                                    onChange={(e) => Model.dollarMethod.set(e.target.value)}
                                    value={Model.dollarMethod.use()}
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value={DollarMethod.CONSTANT}>{DollarMethod.CONSTANT}</Radio.Button>
                                    <Radio.Button value={DollarMethod.CURRENT}>{DollarMethod.CURRENT}</Radio.Button>
                                </Radio.Group>
                            </div>
                            <TestSelect
                                label={"Discounting Convention"}
                                required
                                className={"w-full"}
                                info={Strings.DISCOUNTING_CONVENTION}
                                placeholder={"Please select a discounting convention"}
                                options={Object.values(DiscountingMethod)}
                                getter={Model.discountingMethod.use}
                                onChange={(change) => Model.discountingMethod.set(change)}
                                error={Model.discountingMethod.useValidation}
                            />
                            <DiscountRates />
                        </div>
                        <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                            <Divider
                                className={"col-span-2 h-fit"}
                                style={{ fontSize: "20px" }}
                                orientation={"left"}
                                orientationMargin={"0"}
                            >
                                <Info text={Strings.LOCATION}>Location</Info>
                            </Divider>
                            <Location model={Model.Location} />
                        </div>
                    </div>

                    {/* Greenhouse Gas Inputs */}
                    <GhgInput />
                </div>
                <div className="max-w-screen-lg">
                    <NistFooter rounded={false} />
                </div>
            </div>
        </motion.div>
    );
}
