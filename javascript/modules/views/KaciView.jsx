/* global module, require, document */
"use strict";

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import KaciReactView from "./KaciReactView.jsx";

var KaciView = function (context, systemSettings, patch, store) {
    var heading = document.createElement("h1");
    heading.innerHTML = "Kaci-05";
    document.body.appendChild(heading);

    var reactComponentsWrapper = document.createElement("div");
    document.body.appendChild(reactComponentsWrapper);
    ReactDOM.render(
        <Provider store={store}>
            <KaciReactView />
        </Provider> 
        , reactComponentsWrapper
    );
};
module.exports = KaciView;