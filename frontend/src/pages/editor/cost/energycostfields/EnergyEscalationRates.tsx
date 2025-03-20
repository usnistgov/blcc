import { mdiRefresh } from "@mdi/js";
import { Switch } from "antd";
import Title from "antd/es/typography/Title";
import { Button, ButtonType } from "components/input/Button";
import { TestNumberInput } from "components/input/TestNumberInput";
import {
    DEFAULT_CONSTANT_ESCALATION_RATE,
    type EscalationRateInfo,
    EscalationRateModel,
} from "model/EscalationRateModel";
import { EnergyCostModel } from "model/costs/EnergyCostModel";
import type { ReactNode } from "react";
import DataGrid from "react-data-grid";
import { Link } from "react-router-dom";
import type { Observable } from "rxjs";
import { Subscribe } from "@react-rxjs/core";
import { Model } from "model/Model";
import { Country } from "constants/LOCATION";

type EscalationRatesProps = {
    title: ReactNode;
    defaultRates$?: Observable<number[]>;
};

export default function EnergyEscalationRates({ title }: EscalationRatesProps) {
    const isConstant = EscalationRateModel.isConstant();
    const areProjectRatesValid = EscalationRateModel.isProjectRatesValid();
    const isUsingCustomEscalationRates = EscalationRateModel.isUsingCustomEscalationRates();
    const isCustomConstantEscRate =
        EscalationRateModel.escalation.use() !== DEFAULT_CONSTANT_ESCALATION_RATE && isConstant;

    return (
        <div>
            <div className="flex flex-row items-center justify-between">
                <Title level={5}>{title}</Title>
                {(isUsingCustomEscalationRates || isCustomConstantEscRate) && (
                    <p className={"-mt-2 text-base-light text-xs"}>{"(User has customized rates)"}</p>
                )}
            </div>
            <div className={"flex flex-row justify-between pb-2"}>
                <span className={"flex flex-row items-center gap-2"}>
                    <p className={"pb-1 text-md"}>Constant</p>
                    <Switch
                        value={isConstant}
                        onChange={EscalationRateModel.Actions.toggleConstant}
                        checkedChildren={"Yes"}
                        unCheckedChildren={"No"}
                    />
                </span>
                {!isConstant && (
                    <div className="flex flex-row items-center">
                        <p className={"-mr-1 text-base-light text-xs"}>{areProjectRatesValid && "Reset"}</p>
                        <Button
                            className={"-scale-x-100"}
                            icon={mdiRefresh}
                            type={ButtonType.LINK}
                            tooltip={"Reset to default based on selected location"}
                            disabled={!areProjectRatesValid}
                            onClick={() => EscalationRateModel.Actions.resetToDefault()}
                        />
                    </div>
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
    const isNonUsLocation = EnergyCostModel.Location.useIsNonUSLocation();
    const isUsingCustomLocation = EnergyCostModel.Location.isUsingCustomLocation();
    const isProjectZipValid = EscalationRateModel.isProjectZipValid();
    const projectCountry = Model.Location.country.use();

    // Using custom values, display grid
    if (isUsingCustomEscalationRates) {
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

    if (!isUsingCustomLocation && projectCountry !== Country.USA) {
        return <EscalationRateGrid rates={EscalationRateModel.useProjectRatesGridValues} />;
    }

    if (isUsingCustomLocation && isNonUsLocation) {
        return (
            <EscalationRateGrid rates={EscalationRateModel.useNonUSLocationGridValues as () => EscalationRateInfo[]} />
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
                onBlur={(event) =>
                    EscalationRateModel.Actions.setConstant(Number.parseFloat(event.currentTarget.value))
                }
                addonAfter={"%"}
            />
        </div>
    );
}
