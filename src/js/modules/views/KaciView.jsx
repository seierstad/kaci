import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import KaciReactView from "./KaciReactView.jsx";


const KaciView = function (context, systemSettings, patch, store) {
    const heading = document.createElement("h1");
    heading.innerHTML = "Kaci-05";
    document.body.appendChild(heading);

    const reactComponentsWrapper = document.createElement("div");
    document.body.appendChild(reactComponentsWrapper);
    ReactDOM.render(
        <Provider store={store}>
            <KaciReactView />
        </Provider>
        , reactComponentsWrapper
    );
};


export default KaciView;
