import { bind } from "@react-rxjs/core";
import { Switch } from "antd";
import Title from "antd/es/typography/Title";
import { CostTypes } from "blcc-format/Format";
import Info from "components/Info";
import { Strings } from "constants/Strings";
import { CostModel } from "model/CostModel";
import { map } from "rxjs";

export namespace Model {
    export const [useSavingsOrBenefits] = bind(
        CostModel.type.$.pipe(
            map((type) => (type === CostTypes.OTHER || type === CostTypes.OTHER_NON_MONETARY ? "Benefits" : "Savings")),
        ),
    );
}

export function CostSavingsSwitch() {
    const savingsOrBenefits = Model.useSavingsOrBenefits();

    return (
        <span>
            <Title level={5}>
                <Info text={Strings.COST_OR_SAVINGS}>Cost or {savingsOrBenefits}</Info>
            </Title>
            <Switch
                checked={CostModel.costOrSavings.use()}
                checkedChildren={savingsOrBenefits}
                unCheckedChildren={"Cost"}
                onChange={(toggle) => CostModel.costOrSavings.set(toggle)}
            />
        </span>
    );
}
