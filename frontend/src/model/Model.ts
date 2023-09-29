import {createSignal} from "@react-rxjs/utils";

const [signal$, setSignal] = createSignal<string>()

const Model = {
    signal$: signal$,
    setSignal: setSignal
}

export default Model;