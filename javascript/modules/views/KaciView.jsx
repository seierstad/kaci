/* global module, require, document */
"use strict";
var KeyboardView = require("./KeyboardView");

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

    var keyboardView = new KeyboardView(context, {
        startKey: 36,
        endKey: 73,
        className: "keyboard"
    });
    document.body.appendChild(keyboardView);
/*
    var ov = new OscillatorView(context, systemSettings.modulation.target.oscillator, patch.oscillator);
    document.body.appendChild(ov);
*/

};
module.exports = KaciView;