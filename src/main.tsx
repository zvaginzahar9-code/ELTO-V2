import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { startClock } from "./motion/clock";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/chrome.css";
import "./styles/scenes.css";
import "./styles/catalog.css";
import "./styles/article.css";

startClock();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
