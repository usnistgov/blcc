import {createSignal} from "@react-rxjs/utils";
import {bind} from "@react-rxjs/core";

const [projectName$, setProjectName] = createSignal<string>()
const [useProjectName] = bind(projectName$, "Unnamed Project");

const Model = {
    projectName$: projectName$,
    setProjectName: setProjectName,
    useProjectName: useProjectName,
}

export default Model;