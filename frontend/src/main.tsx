import App from "App";
import ReactDOM from "react-dom/client";
import "index.css";
import "ant-overridden.css";
import { StrictMode } from "react";
import "styles/scrollbar.sass";
import { BrowserRouter } from "react-router-dom";

console.log(`BLCC frontend version %c ${__APP_VERSION__}`, "color: cyan;");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
);
