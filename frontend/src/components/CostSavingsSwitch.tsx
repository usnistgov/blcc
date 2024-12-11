import { bind } from "@react-rxjs/core";
import { Switch } from "antd";
import Title from "antd/es/typography/Title";
import { CostTypes } from "blcc-format/Format";
import Info from "components/Info";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { map } from "rxjs";

export namespace CostSavingsSwitchModel {
    export const [useSavingsOrBenefits] = bind(
        CostModel.type$.pipe(
            map((type) => (type === CostTypes.OTHER || type === CostTypes.OTHER_NON_MONETARY ? "Benefits" : "Savings")),
        ),
    );
}

export function CostSavingsSwitch() {
    return (
        <span>
            <Title level={5}>
                <Info text={Strings.COST_OR_SAVINGS}>Cost or {CostSavingsSwitchModel.useSavingsOrBenefits()}</Info>
            </Title>
            <Switch
                checked={CostModel.useCostOrSavings()}
                checkedChildren={CostSavingsSwitchModel.useSavingsOrBenefits()}
                unCheckedChildren={"Cost"}
                onChange={(checked) => CostModel.sCostSavings$.next(checked)}
            />
        </span>
    );
}
