import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Loading from "./components/SpecialComponents/Loading";

const Root = () => {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return <Loading onComplete={() => setIsReady(true)} />;
  }

  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
