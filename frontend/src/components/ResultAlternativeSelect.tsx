import { Select } from "antd";
import Title from "antd/es/typography/Title";
import { selectAlternative, useOptions, useSelection } from "model/ResultModel";

export default function ResultAlternativeSelect() {
    return (
        <>
            <Title level={5}>Annual Results for Alternative</Title>
            <Select className={"w-1/4"} onChange={selectAlternative} options={useOptions()} value={useSelection()} />
        </>
    );
}
