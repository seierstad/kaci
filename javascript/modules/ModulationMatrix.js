/*global require, module */
"use strict";
var LFO = require("./LFO");
var ModulationMatrix = function (context, patch) {
    var lfo = [],
        i,
        j;

    for (i = 0, j = patch.lfo.length; i < j; i += 1) {
        if (patch.lfo[i].mode === "global" || patch.lfo[i].mode === "retrigger") {
            lfo[i] = new LFO(context, patch.lfo[i], "lfo" + i, {
                syncMaster: i === 0
            });
            lfo[i].addOutput("oscillatorDetune", 1200);
            lfo[i].addOutput("pdMix", 1);
            lfo[i].addOutput("resonance", 10);
        }
    }
    this.globalModulators = {
        "lfo": lfo
    };

    function startGlobalModulators() {
        this.globalModulators.lfo.forEach(function (lfo) {
            lfo.start();
        });
    };

    function stopGlobalModulators() {
        this.globalModulators.lfo.forEach(function (lfo) {
            lfo.stop();
        });
    };

    context.addEventListener('voice.first.started', startGlobalModulators.bind(this), false);

    /*
        eventlistener modulation.change.connect {source, target, amount}
        eventlistener modulation.change.disconnect {source, target}
        eventlistener modulation.change.amount {source, target, amount}

     */

};
ModulationMatrix.prototype.patch = function patch(voice, patch) {
    var locals = voice.getModulators(),
        modulatorType;

    var patchType = function patchType(modulatorType) {
        var i, j, l, g, path;
        l = locals[modulatorType] || [];
        g = this.globalModulators[modulatorType] || [];
        var connector = function (modulatorIndex) {
            return function connect(path) {
                var pathArray = path.split("."),
                    step, currentTarget = voice;

                for (step in pathArray) {
                    if (currentTarget[pathArray[step]]) {
                        currentTarget = currentTarget[pathArray[step]];
                    } else {
                        return false;
                    }
                }
                if (currentTarget !== voice) {
                    (l[modulatorIndex] || g[modulatorIndex]).connect(currentTarget);
                }
            };
        };
        for (i = 0, j = Math.max(l.length, g.length); i < j; i += 1) {
            if (patch[modulatorType][i]) {
                Object.keys(patch[modulatorType][i]).forEach(connector(i));
            }
        }
    };

    Object.keys(patch).forEach(patchType.bind(this));
};
module.exports = ModulationMatrix;