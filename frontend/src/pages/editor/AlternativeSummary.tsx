import { Model } from "../../model/Model";
import { Divider, Typography } from "antd";
import button, { ButtonType } from "../../components/Button";
import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";
import { mergeMap, from } from "rxjs";
import { bind } from "@react-rxjs/core";
import { map, toArray, withLatestFrom } from "rxjs/operators";

const { Title } = Typography;
const { component: Button } = button();

const combinedCostObject$ = Model.costs$.pipe(
    map((costs) => {
        const costObject = costs.reduce((result, cost) => {
            result[cost.id] = cost;
            return result;
        }, {});
        return costObject;
    })
);

const altCostObject$ = Model.alternatives$.pipe(
    withLatestFrom(combinedCostObject$),
    mergeMap(([altArray, combinedCostObj]) =>
        from(altArray).pipe(
            map((alt) => {
                const updatedCosts = alt.costs.map((cost) => combinedCostObj[cost]);
                return { ...alt, costs: updatedCosts };
            }),
            toArray()
        )
    )
);

const [useAltCostObject] = bind(altCostObject$, []);

export default function AlternativeSummary() {
    const finalAlternatives = useAltCostObject();

    return (
        <div>
            <div className={"w-screen h-full "}>
                <div className="add-alternative flex flex-col">
                    <Button className="" type={ButtonType.LINK}>
                        <Icon path={mdiPlus} size={1} />
                        Add Alternative
                    </Button>
                    <Divider className="p-0 m-0" />
                </div>
                {finalAlternatives?.map((alt) => (
                    <div className="flex justify-center align-middle">
                        <div className="bg-primary-light p-5 w-1/2 rounded mb-5">
                            <Title level={4}>{alt?.name}</Title>
                            <p>{alt?.description}</p>
                            <br />
                            <div className="costs flex justify-between">
                                <div className="water-costs border">
                                    <Title level={5}>Energy Costs </Title>
                                    <Divider className="m-0" />
                                </div>
                                <div className="water-costs border">
                                    <Title level={5}>Water Costs </Title>
                                    <Divider className="m-0" />
                                </div>
                                <div className="water-costs border">
                                    <Title level={5}>Capital Costs </Title>
                                    <Divider className="m-0" />
                                </div>
                                <div className="water-costs border">
                                    <Title level={5}>Other Costs </Title>
                                    <Divider className="m-0" />
                                </div>
                            </div>
                            {alt.costs.map((cost) => (
                                <div>{cost?.name}</div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
