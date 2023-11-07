import { Model } from "../../model/Model";
import { Divider, Typography } from "antd";
import button, { ButtonType } from "../../components/Button";
import Icon from "@mdi/react";
import { mdiPlus } from "@mdi/js";

const { Title } = Typography;
const { component: Button } = button();

export default function AlternativeSummary() {
    const alternatives = Model.useAlternatives();
    const costs = Model.useCosts();
    const costsHash = {};
    costs.forEach((item) => {
        costsHash[item.id] = item;
    });

    alternatives.forEach((alt) => {
        const altCosts = alt.costs.map((altCost) => {
            return costsHash[altCost];
        });
        alt.costs = altCosts;
    });

    console.log(alternatives);
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
                {alternatives?.map((alt) => (
                    <div className="flex justify-center align-middle">
                        <div className="bg-primary-light p-5 w-1/2 rounded mb-5">
                            <Title level={4}>{alt?.name}</Title>
                            <p>{alt?.description}</p>
                            <br />
                            <div className="costs flex justify-between">
                                <div className="water-costs border">
                                    <Title level={5}>Energy Costs total</Title>
                                    <Divider className="m-0" />
                                </div>
                                <div className="water-costs border">
                                    <Title level={5}>Water Costs total</Title>
                                    <Divider className="m-0" />
                                </div>
                                <div className="water-costs border">
                                    <Title level={5}>Capital Costs total</Title>
                                    <Divider className="m-0" />
                                </div>
                                <div className="water-costs border">
                                    <Title level={5}>Other Costs total</Title>
                                    <Divider className="m-0" />
                                </div>
                            </div>
                            {/* {alt.costs.map((cost) => (
                                <div>{cost}</div>
                            ))} */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
