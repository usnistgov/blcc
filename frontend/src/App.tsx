import button from "./components/Button";
import {useSubscribe} from "./hooks/UseSubscribe";
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import useModelParam from "./hooks/UseModelParam";
import Model from "./model/Model";

const {click$: helloClick$, component: HelloButton} = button();

export default function App() {
    useSubscribe(Model.signal$, (value) => console.log(value));

    return <BrowserRouter>
        <Routes>
            <Route path={"/"} element={<Root/>}/>
            <Route path={":test"} element={<Test/>}/>
        </Routes>
    </BrowserRouter>
}

function Root() {
    const navigate = useNavigate();
    useSubscribe(helloClick$, () => navigate("/asdf"));

    return <HelloButton>
        Hello, World!
    </HelloButton>
}

function Test() {
    useModelParam("test", Model.setSignal);
    return <div>
        Hello, World!
    </div>
}
