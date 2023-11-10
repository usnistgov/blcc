import { Model } from "../../model/Model";
import { Divider, Typography } from "antd";
import button, { ButtonType } from "../../components/Button";
import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";
import { mergeMap, from } from "rxjs";
import { bind } from "@react-rxjs/core";
import { map, toArray, withLatestFrom } from "rxjs/operators";
import { CostTypes } from "../../blcc-format/Format";

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
                let [waterCosts, energyCosts] = [0, 0];
                let capitalCosts = {
                    total: 0,
                    CAPITAL: 0,
                    REPLACEMENT_CAPITAL: 0,
                    OMR: 0,
                    IMPLEMENTATION_CONTRACT: 0,
                    RECURRING_CONTRACT: 0
                };
                let otherCosts = {
                    Other: 0,
                    "Non-Monetory": 0
                };
                const updatedCosts = alt.costs.map((cost) => {
                    if (combinedCostObj[cost]?.type === CostTypes.CAPITAL) {
                        capitalCosts.CAPITAL += 1;
                        capitalCosts.total += 1;
                    } else if (combinedCostObj[cost]?.type === CostTypes.ENERGY) energyCosts += 1;
                    else if (combinedCostObj[cost]?.type === CostTypes.WATER) waterCosts += 1;
                    else if (combinedCostObj[cost]?.type === CostTypes.REPLACEMENT_CAPITAL) {
                        capitalCosts.REPLACEMENT_CAPITAL += 1;
                        capitalCosts.total += 1;
                    } else if (combinedCostObj[cost]?.type === CostTypes.OMR) {
                        capitalCosts.OMR += 1;
                        capitalCosts.total += 1;
                    } else if (combinedCostObj[cost]?.type === CostTypes.REPLACEMENT_CAPITAL) {
                        capitalCosts.REPLACEMENT_CAPITAL += 1;
                        capitalCosts.total += 1;
                    } else if (combinedCostObj[cost]?.type === CostTypes.RECURRING_CONTRACT) {
                        capitalCosts.RECURRING_CONTRACT += 1;
                        capitalCosts.total += 1;
                    } else if (combinedCostObj[cost]?.type === CostTypes.OTHER_NON_MONETARY) {
                        otherCosts.Other += 1;
                        otherCosts["Non-Monetory"] += 1;
                    } else otherCosts.Other += 1;
                    return combinedCostObj[cost];
                });
                return { ...alt, costs: updatedCosts, capitalCosts, energyCosts, waterCosts, otherCosts };
            }),
            toArray()
        )
    )
);

const [useAltCostObject] = bind(altCostObject$, []);

export default function AlternativeSummary() {
    const finalAlternatives = useAltCostObject();
    const allCosts = Object.keys(CostTypes);
    console.log(finalAlternatives, allCosts);

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
                                <div className="water-costs ">
                                    <Title level={5}>Energy Costs {alt?.energyCosts}</Title>
                                    <Divider className="m-0" />
                                </div>
                                <div className="water-costs ">
                                    <Title level={5}>Water Costs {alt?.waterCosts}</Title>
                                    <Divider className="m-0" />
                                </div>
                                <div className="water-costs ">
                                    <Title level={5}>Capital Costs {alt?.capitalCosts?.total}</Title>
                                    <Divider className="m-0" />
                                    {Object.keys(alt?.capitalCosts).map((type) =>
                                        type !== "total" ? (
                                            <p>
                                                {type} - {alt?.capitalCosts[type]}
                                            </p>
                                        ) : (
                                            ""
                                        )
                                    )}
                                </div>
                                <div className="water-costs ">
                                    <Title level={5}>Other Costs {alt?.otherCosts.Other}</Title>
                                    <Divider className="m-0" />
                                    {Object.keys(alt?.otherCosts).map(
                                        (type) => (
                                            // type !== "Other" ? (
                                            <p>
                                                {type} - {alt?.otherCosts[type]}
                                            </p>
                                        )
                                        // ) : (
                                        //     ""
                                        // )
                                    )}
                                </div>
                            </div>
                            {/* {alt.costs.map((cost) => (
                                <div>{cost?.name}</div>
                            ))} */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
