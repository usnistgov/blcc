import { mdiRefresh } from "@mdi/js";
import { Switch } from "antd";
import Title from "antd/es/typography/Title";
import { Button, ButtonType } from "components/input/Button";
import { TestNumberInput } from "components/input/TestNumberInput";
import { type EscalationRateInfo, EscalationRateModel } from "model/EscalationRateModel";
import { EnergyCostModel } from "model/costs/EnergyCostModel";
import type { ReactNode } from "react";
import DataGrid from "react-data-grid";
import { Link } from "react-router-dom";
import type { Observable } from "rxjs";
import { Subscribe } from "@react-rxjs/core";
import { Model } from "model/Model";

type EscalationRatesProps = {
    title: ReactNode;
    defaultRates$?: Observable<number[]>;
};

export default function EnergyEscalationRates({ title }: EscalationRatesProps) {
    const isConstant = EscalationRateModel.isConstant();
    const areProjectRatesValid = EscalationRateModel.isProjectRatesValid();
    const projectLength = Model.constructionPeriod.use() + (Model.studyPeriod.use() ?? 0) + 1;

    return (
        <div>
            <Title level={5}>{title}</Title>
            <div className={"flex flex-row justify-between pb-2"}>
                <span className={"flex flex-row items-center gap-2"}>
                    <p className={"pb-1 text-md"}>Constant</p>
                    <Switch
                        value={isConstant}
                        onChange={(changeBool) => EscalationRateModel.Actions.toggleConstant(changeBool, projectLength)}
                        checkedChildren={"Yes"}
                        unCheckedChildren={"No"}
                    />
                </span>
                {!isConstant && (
                    <Button
                        className={"-scale-x-100"}
                        icon={mdiRefresh}
                        type={ButtonType.LINK}
                        tooltip={"Reset to default based on selected location"}
                        disabled={!areProjectRatesValid}
                        onClick={() => EscalationRateModel.Actions.resetToDefault()}
                    />
                )}
            </div>
            {(isConstant && <ConstantEscalationInput />) || (
                <Subscribe fallback={"Array Escalation Input fallback"}>
                    <ArrayEscalationInput />
                </Subscribe>
            )}
        </div>
    );
}

function ArrayEscalationInput() {
    const isUsingCustomEscalationRates = EscalationRateModel.isUsingCustomEscalationRates();
    const isSectorValid = EscalationRateModel.isSectorValid();
    const isZipValid = EnergyCostModel.Location.isZipValid();
    const isUsingCustomLocation = EnergyCostModel.Location.isUsingCustomLocation();
    const isProjectZipValid = EscalationRateModel.isProjectZipValid();

    // Using custom values, display grid
    if (isUsingCustomEscalationRates) {
        console.log("Using custom escalation rates");
        return <EscalationRateGrid rates={EscalationRateModel.useCustomEscalationGridValues} />;
    }

    // Sector is not valid, display message
    if (!isSectorValid) {
        return (
            <div className={"flex flex-col gap-y-2 text-base-dark"}>
                <p>Please select a Customer Sector</p>
            </div>
        );
    }

    // Custom location is being used, but the zip code is not valid, display message
    if (isUsingCustomLocation && !isZipValid) {
        return (
            <div className={"flex flex-col gap-y-2 text-base-dark"}>
                <p>Custom ZIP code is invalid</p>
            </div>
        );
    }

    // Custom location is being used, zip code is valid, display grid
    if (isUsingCustomLocation && isZipValid) {
        // Typescript doesn't like typing this hook for some reason, so I have done it manually
        return <EscalationRateGrid rates={EscalationRateModel.useCustomZipGridValues as () => EscalationRateInfo[]} />;
    }

    // Project zip code is not valid, display message
    if (!isProjectZipValid) {
        return (
            <div className={"flex flex-col gap-y-2 text-base-dark"}>
                <p>Default escalation rates requires a ZIP code</p>
                <p>
                    Set the ZIP code for this cost or for the entire project on the{" "}
                    <Link className={"text-primary"} to={"/editor"}>
                        General Information
                    </Link>{" "}
                    page
                </p>
            </div>
        );
    }

    // Using project rates, display grid
    return <EscalationRateGrid rates={EscalationRateModel.useProjectRatesGridValues} />;
}

type EscalationRateGridProps = {
    rates: () => EscalationRateInfo[];
};

function EscalationRateGrid({ rates }: EscalationRateGridProps) {
    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            <DataGrid
                className={"rdg-light h-full"}
                rows={rates()}
                columns={EscalationRateModel.COLUMNS}
                onRowsChange={EscalationRateModel.Actions.setRates}
            />
        </div>
    );
}

function ConstantEscalationInput() {
    return (
        <div>
            <TestNumberInput
                className={"w-full"}
                getter={EscalationRateModel.useConstantEscalationRatePercentage}
                onChange={EscalationRateModel.Actions.setConstant}
                addonAfter={"%"}
            />
        </div>
    );
}
