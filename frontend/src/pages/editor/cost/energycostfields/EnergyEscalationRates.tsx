import { mdiRefresh } from "@mdi/js";
import { Switch } from "antd";
import Title from "antd/es/typography/Title";
import { Button, ButtonType } from "components/input/Button";
import { TestNumberInput } from "components/input/TestNumberInput";
import { useSubscribe } from "hooks/UseSubscribe";
import { EscalationRateModel } from "model/EscalationRateModel";
import { EnergyCostModel } from "model/costs/EnergyCostModel";
import type { ReactNode } from "react";
import DataGrid from "react-data-grid";
import { Link } from "react-router-dom";
import { type Observable, combineLatest } from "rxjs";

type EscalationRatesProps = {
    title: ReactNode;
    defaultRates$?: Observable<number[]>;
};

export default function EnergyEscalationRates({ title }: EscalationRatesProps) {
    const isConstant = EscalationRateModel.isConstant();
    const areProjectRatesValid = EscalationRateModel.isProjectRatesValid();

    // If the location is set to null, and we are not using custom rates, reset to project rates if available
    useSubscribe(
        combineLatest([
            EnergyCostModel.location.$,
            EnergyCostModel.Location.isZipValid$,
            EscalationRateModel.isUsingCustomEscalationRates$,
        ]),
        ([location, isZipValid, isUsingCustomEscalationRates]) => {
            if ((location === undefined || !isZipValid) && !isUsingCustomEscalationRates) {
                EscalationRateModel.escalation.set(undefined);
            }
        },
    );

    // Set the rates when the custom zipcode get set
    useSubscribe(EscalationRateModel.setCustomZipRates$, (rates) => EscalationRateModel.escalation.set(rates));

    return (
        <div>
            <Title level={5}>{title}</Title>
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
                    <Button
                        className={"-scale-x-100"}
                        icon={mdiRefresh}
                        type={ButtonType.LINK}
                        tooltip={"Reset to default"}
                        disabled={!areProjectRatesValid}
                        onClick={() => EscalationRateModel.Actions.resetToDefault()}
                    />
                )}
            </div>
            {(isConstant && <ConstantEscalationInput />) || <ArrayEscalationInput />}
        </div>
    );
}

function ArrayEscalationInput() {
    return EscalationRateModel.showGrid() ? <EscalationRateGrid /> : <Message />;
}

function EscalationRateGrid() {
    return (
        <div className={"w-full overflow-hidden rounded shadow-lg"}>
            <DataGrid
                className={"rdg-light h-full"}
                rows={EscalationRateModel.gridValues()}
                columns={EscalationRateModel.COLUMNS}
                onRowsChange={EscalationRateModel.Actions.setRates}
            />
        </div>
    );
}

function Message() {
    const isUsingCustomLocation = EnergyCostModel.Location.isUsingCustomLocation();
    const isCustomZipValid = EnergyCostModel.Location.isZipValid();
    const isSectorValid = EscalationRateModel.isSectorValid();

    if (!isSectorValid) {
        return (
            <div className={"flex flex-col gap-y-2 text-base-dark"}>
                <p>Please select a Customer Sector</p>
            </div>
        );
    }

    if (isUsingCustomLocation && !isCustomZipValid) {
        return (
            <div className={"flex flex-col gap-y-2 text-base-dark"}>
                <p>Custom ZIP code is invalid</p>
            </div>
        );
    }

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

function ConstantEscalationInput() {
    return (
        <div>
            <TestNumberInput
                className={"w-full"}
                getter={EscalationRateModel.escalation.use as () => number}
                onChange={EscalationRateModel.Actions.setConstant}
                addonAfter={"%"}
            />
        </div>
    );
}
