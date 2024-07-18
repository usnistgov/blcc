import App from "App";
import ReactDOM from "react-dom/client";
import "index.css";
import "ant-overridden.css";
import { StrictMode } from "react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
