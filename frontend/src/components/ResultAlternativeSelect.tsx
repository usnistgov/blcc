import { Select } from "antd";
import Title from "antd/es/typography/Title";
import { ResultModel } from "model/ResultModel";

export default function ResultAlternativeSelect() {
    return (
        <div className="w-1/5">
            <Title level={5}>Annual Results for Alternative</Title>
            <Select
                className={"w-4/5"}
                onChange={ResultModel.selectAlternative}
                options={ResultModel.useAlternativeOptions()}
                value={ResultModel.useSelection()}
            />
        </div>
    );
}
