/* global require, module, document */
"use strict";
var ViewUtils = require('./ViewUtils');
var Utils = require('../Utils');

function countObjectKeys(config, level) {
    var count = 0,
        keys, i, j;
    keys = Object.keys(config);
    if (level === 0) {
        return keys.length;
    }

    for (i = 0, j = keys.length; i < j; i += 1) {
        count += countObjectKeys(config[keys[i]], level - 1);
    }
    return count;
}

var ModulationMatrixView = function (context, configuration, patch) {
    var view, table, colgroup, col, thead, tbody, row, cell, i, j, k, l;
    table = document.createElement("table");
    table.setAttribute("class", "modulation-matrix");

    // create colgroups
    colgroup = document.createElement("colgroup");
    table.appendChild(colgroup);
    [2, configuration.source.lfo, configuration.source.envelope + 1].forEach(function (span) {
        col = document.createElement("col");
        col.setAttribute("span", span);
        colgroup.appendChild(col);
    });

    // create table head
    thead = document.createElement("thead");
    table.appendChild(thead);

    row = document.createElement("tr");
    thead.appendChild(row);
    cell = document.createElement("td");
    cell.setAttribute("scope", "col");
    cell.setAttribute("colspan", 2);
    cell.setAttribute("rowspan", 2);
    row.appendChild(cell);
    cell = document.createElement("th");
    cell.setAttribute("scope", "colspan");
    cell.setAttribute("colspan", configuration.source.lfo);
    cell.innerHTML = "LFO";
    row.appendChild(cell);
    cell = document.createElement("th");
    cell.setAttribute("scope", "colspan");
    cell.setAttribute("colspan", configuration.source.envelope + 1);
    cell.innerHTML = "Envelope";
    row.appendChild(cell);
    row = document.createElement("tr");
    thead.appendChild(row);
    for (i = 0, j = configuration.source.lfo; i < j; i += 1) {
        cell = document.createElement("th");
        cell.setAttribute("scope", "col");
        cell.innerHTML = i;
        row.appendChild(cell);
    }
    for (i = 0, j = configuration.source.envelope; i < j; i += 1) {
        cell = document.createElement("th");
        cell.setAttribute("scope", "col");
        cell.innerHTML = i;
        row.appendChild(cell);
    }

    cell = document.createElement("th");
    cell.setAttribute("scope", "col");
    cell.innerHTML = "none";
    row.appendChild(cell);


    var targetHeader = false;

    function moduleTargets(moduleName) {
        var i, j, k, l,
            span,
            id,
            paramNames,
            input,
            label,
            moduleConfig = configuration.target[moduleName];

        paramNames = Object.keys(moduleConfig);
        tbody = document.createElement("tbody");

        function rangeInput(prefix, value, sourceType, sourceIndex, targetModule, targetParameter) {
            var label,
                select = document.createElement("select"),
                option;

            select.id = prefix + "-range";
            select.dataset.sourceType = sourceType;
            select.dataset.sourceIndex = sourceIndex;
            select.dataset.targetModule = targetModule;
            select.dataset.targetParameter = targetParameter;
            select.dataset.type = "range";
            [{
                value: "positive",
                label: "+",
                title: "positive"
            }, {
                value: "full",
                label: "±",
                title: "full"
            }, {
                value: "negative",
                label: "-",
                title: "negative"
            }].forEach(function (item) {
                option = document.createElement("option");
                option.value = item.value;
                if (option.value === value) {
                    option.selected = true;
                }
                option.innerHTML = item.label;
                option.title = item.title;
                select.appendChild(option);

                label = document.createElement("label");
                label.setAttribute("for", prefix + "-range");

            });
            return {
                input: select,
                label: label
            };
        }

        function amountInput(prefix, value, sourceType, sourceIndex, targetModule, targetParameter) {
            var label = document.createElement("label"),
                input = document.createElement("input"),
                id = prefix + "-amount";

            input.type = "range";
            input.min = 0;
            input.max = 1;
            input.step = 0.001;
            input.id = id;
            input.value = value || 1;
            input.dataset.sourceType = sourceType;
            input.dataset.sourceIndex = sourceIndex;
            input.dataset.targetModule = targetModule;
            input.dataset.targetParameter = targetParameter;
            input.dataset.type = "amount";


            label.innerHTML = "amount";
            label.setAttribute("for", id);

            return {
                input: input,
                label: label
            };
        }

        for (i = 0, j = paramNames.length; i < j; i += 1) {

            row = document.createElement("tr");

            if (i === 0) {
                cell = document.createElement("th");
                span = document.createElement("span"); // in order to rotate text
                span.innerHTML = moduleName;
                cell.setAttribute("rowspan", paramNames.length);
                cell.setAttribute("scope", "rowgroup");
                cell.appendChild(span);
                row.appendChild(cell);
            }

            cell = document.createElement("th");
            cell.setAttribute("scope", "row");
            cell.innerHTML = paramNames[i];
            row.appendChild(cell);

            function cellContent(type, index, isNone) {
                var name = "",
                    range, amount,
                    patchRange,
                    patchAmount;

                cell = document.createElement("td");
                label = document.createElement("label");
                id = type + "-" + (isNone ? "none" : index) + "-" + moduleName + "-" + paramNames[i];
                label.innerHTML = "connect " + id.split("-").join(" ");

                label.setAttribute("for", id);
                cell.appendChild(label);

                input = document.createElement("input");

                input.id = id;
                input.dataset.sourceIndex = index;
                input.dataset.targetModule = moduleName;
                input.dataset.targetParameter = paramNames[i];
                input.dataset.type = "connection";

                if (type === "envelope") {
                    input.dataset.sourceType = "envelope";
                    name = type + "-" + moduleName + "-" + paramNames[i];
                    input.value = index;
                    input.setAttribute("type", "radio");
                } else {
                    input.dataset.sourceType = "lfo";
                    name = id;
                    input.setAttribute("type", "checkbox");
                }
                input.name = name;

                var target = moduleName + "." + paramNames[i];
                if (patch[type] && patch[type][index] && patch[type][index].hasOwnProperty(target)) {
                    input.checked = true;
                    patchRange = patch[type][index][target].range;
                    patchAmount = patch[type][index][target].amount;

                }

                function anyPatchConnection(target) {
                    return patch[type].some(function (i) {
                        return i.hasOwnProperty(target);
                    });
                }
                if (isNone && !anyPatchConnection(target)) {
                    input.checked = true;
                }
                cell.appendChild(input);

                if (!isNaN(parseInt(index, 10))) {
                    range = rangeInput(id, patchRange, type, index, moduleName, paramNames[i]);
                    cell.appendChild(range.label);
                    cell.appendChild(range.input);
                    amount = amountInput(id, patchAmount, type, index, moduleName, paramNames[i]);
                    cell.appendChild(amount.label);
                    cell.appendChild(amount.input);
                }
                row.appendChild(cell);

            }
            for (k = 0, l = configuration.source.lfo; k < l; k += 1) {
                cellContent("lfo", k);
            }
            for (k = 0, l = configuration.source.envelope; k < l; k += 1) {
                cellContent("envelope", k);
            }
            cellContent("envelope", null, true);

            tbody.appendChild(row);
        }
        table.appendChild(tbody);
    }

    var eventHandler = function (event) {
        var eventData = {},
            key,
            customEvent,
            eventName,
            rangeInput,
            amountInput;

        for (key in event.target.dataset) {
            if (event.target.dataset.hasOwnProperty(key)) {
                eventData[key] = event.target.dataset[key];
            }
        }

        switch (eventData.type) {
        case "connection":
            if (event.target.checked === true) {
                eventName = "modulation.change.connect";
                rangeInput = event.target.parentElement.querySelector("[id$='range']");
                if (rangeInput) {
                    eventData.range = rangeInput.value;
                }
                amountInput = event.target.parentElement.querySelector("[id$='amount']");
                if (amountInput) {
                    eventData.amount = amountInput.value;
                }
            } else {
                eventName = "modulation.change.disconnect";
            }
            break;
        case "amount":
            eventName = "modulation.change.amount";
            eventData.amount = event.target.value;
            break;
        case "range":
            eventName = "modulation.change.range";
            eventData.range = event.target.value;
            break;
        }
        customEvent = new CustomEvent(eventName, {
            "detail": eventData
        });
        context.dispatchEvent(customEvent);
        console.dir(event);
    };

    Object.keys(configuration.target).forEach(moduleTargets);
    table.addEventListener("change", eventHandler, false);
    table.addEventListener("input", eventHandler, false);

    view = table;
    return view;
};

module.exports = ModulationMatrixView;