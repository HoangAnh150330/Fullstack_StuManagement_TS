import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { ConfigProvider } from "antd";
import "antd/dist/reset.css";   
import "./index.css";          

import { loadUserFromStorage } from "./redux/auth-slice";

store.dispatch(loadUserFromStorage());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);