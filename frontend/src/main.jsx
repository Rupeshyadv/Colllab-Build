import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./store/Store.js";
import { PersistGate } from "redux-persist/integration/react";
import Spinner from "./components/Spinner.jsx";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<Spinner />}>
        <Toaster />
        <App />
      </PersistGate>
    </Provider>
  </BrowserRouter>
);
