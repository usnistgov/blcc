import {BrowserRouter, Route, Routes} from "react-router-dom";
import EditorAppBar from "./components/EditorAppBar";
import ResultsAppBar from "./components/ResultsAppBar";

export default function App() {
    return <BrowserRouter>
        <Routes>
            <Route path={"/results/*"} element={<ResultsAppBar/>}/>
            <Route path={"/*"} element={<EditorAppBar/>}/>
        </Routes>
        <Routes>

        </Routes>
    </BrowserRouter>
}
