import { useE3Result } from "../../components/ResultsAppBar";

export default function Inputs() {
    const e3Result = useE3Result();

    return (
        <div className={"w-full h-full bg-base"}>
            <h1>Inputs</h1>
            <pre>{e3Result === undefined ? "No Results" : JSON.stringify(e3Result, undefined, 4)}</pre>
        </div>
    );
}
