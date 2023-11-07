import { Model } from "../../model/Model";
import { Typography } from "antd";

const { Title } = Typography;

export default function AlternativeSummary() {
    const alternatives = Model.useAlternatives();
    const costs = Model.useCosts();

    console.log(alternatives, costs);
    return (
        <div className="">
            <div className={"w-screen h-full bg-base"}>
                <div>Add Alternative</div>
                {alternatives?.map((alt) => (
                    <div className="flex justify-center align-middle">
                        <div className="bg-primary p-5 w-1/2 rounded">
                            <Title level={3}>Alternative #{alt?.id}</Title>
                            <Title level={4}>{alt?.name}</Title>
                            <p>{alt?.description}</p>
                            {alt.costs.map((cost) => (
                                <div>{cost}</div>
                            ))}
                        </div>
                        <div></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
