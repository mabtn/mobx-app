import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RootProvider } from "@app/RootProvider";
import { App } from "@app/App";
import { createRootStore } from "@app/bootstrap";
import "./styles/index.css";

const root = createRootStore();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RootProvider store={root}>
            <App />
        </RootProvider>
    </StrictMode>,
);
