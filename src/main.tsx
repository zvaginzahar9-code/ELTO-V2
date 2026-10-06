import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { startClock } from "./motion/clock";

import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/chrome.css";
import "./styles/scenes.css";
import "./styles/home.css";
import "./styles/catalog.css";
import "./styles/article.css";
import "./styles/mobile.css";
import "./styles/phone.css";

startClock();

// главная пришла с первым экраном в HTML — сцена героя подхватит его без повтора
if (document.querySelector("#root .hero--boot")) document.documentElement.dataset.boot = "hero";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
