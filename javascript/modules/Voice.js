/*global require, module */
"use strict";
var EnvelopeGenerator = require('./EnvelopeGenerator');
var PDOscillator = require('./PDOscillator');

var Voice = function (context, patch, frequency, options) {
    var key,
        i, j,
        env1patch,
        newEnvelope,
        that = this;

    if (options) {
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                this[key] = options[key];
            }
        }
    }
    this.vcaNode = context.createGain();
    this.vca = this.vcaNode.gain;
    this.vca.value = 1;
    this.envelope = [];

    for (i = 0, j = patch.envelope.length; i < j; i += 1) {
        this.envelope[i] = new EnvelopeGenerator(context, patch.envelope[i], 'envelope' + i);
    }

    this.oscillator = new PDOscillator(context, patch.oscillator, frequency, options);
    this.oscillator.connect(this.vcaNode);
    this.envelope[0].connect(this.vca);
    //    this.envelope[1].connect(this.oscillator.detune);

    var getHandler = function (parameter) {
        var result;
        switch (parameter) {
        case 'waveform':
            result = function (evt) {
                that.oscillator.setWaveform(evt.detail);
            };
            break;
        case 'wrapper':
            result = function (evt) {
                that.oscillator.setWrapper(evt.detail);
            };
            break;
        case 'resonanceActive':
            result = function (evt) {
                that.oscillator.resonanceActive = evt.detail;
            };
            break;
        case 'env0data':
        case 'env1data':
            result = function (evt) {
                var d = evt.detail;
                switch (d.type) {
                case 'add':
                    that.oscillator.addPDEnvelopePoint(parameter === 'env0data' ? 0 : 1, d.index, [d.data.x, d.data.y]);
                    break;
                case 'move':
                    that.oscillator.movePDEnvelopePoint(parameter === 'env0data' ? 0 : 1, d.index, [d.data.x, d.data.y]);
                    break;
                case 'delete':
                    that.oscillator.deletePDEnvelopePoint(parameter === 'env0data' ? 0 : 1, d.index);
                    break;
                }
            };
            break;
        default:
            result = function (evt) {
                that.oscillator[parameter].setValueAtTime(evt.detail, that.oscillator.context.currentTime);
            };
            break;
        }
        return result;
    };

    var eventHandlers = [{
        eventName: 'oscillator.change.waveform',
        handler: getHandler('waveform')
    }, {
        eventName: 'oscillator.change.wrapper',
        handler: getHandler('wrapper')
    }, {
        eventName: 'oscillator.change.resonance',
        handler: getHandler('resonance')
    }, {
        eventName: 'oscillator.change.mix',
        handler: getHandler('mix')
    }, {
        eventName: 'oscillator.resonance.toggle',
        handler: getHandler('resonanceActive')
    }, {
        eventName: 'oscillator.env0.change.data',
        handler: getHandler('env0data')
    }, {
        eventName: 'oscillator.env1.change.data',
        handler: getHandler('env1data')
    }];

    var addVoiceEventListeners = function () {
        var i, j;
        for (i = 0, j = eventHandlers.length; i < j; i += 1) {
            context.addEventListener(eventHandlers[i].eventName, eventHandlers[i].handler);
        }
    };
    var getRemoveEventFunction = function () {
        return function removeVoiceEventListeners() {
            var i, j;
            for (i = 0, j = eventHandlers.length; i < j; i += 1) {
                context.removeEventListener(eventHandlers[i].eventName, eventHandlers[i].handler);
            }
        };
    };

    this.removeVoiceEventListeners = getRemoveEventFunction();
    addVoiceEventListeners();
};

Voice.prototype.connect = function (node) {
    if (node.hasOwnProperty('input')) {
        this.vcaNode.connect(node.input);
    } else {
        this.vcaNode.connect(node);
    }
};
Voice.prototype.disconnect = function () {
    this.vcaNode.disconnect();
};
Voice.prototype.destroy = function () {
    this.removeVoiceEventListeners();
    this.envelope.forEach(function (envelope) {
        envelope.disconnect();
        envelope = null;
    });
    this.oscillator.destroy();
    this.oscillator = null;
    this.disconnect();
    this.vcaNode = null;
};
Voice.prototype.start = function (time) {
    this.startTime = time;
    this.envelope.forEach(function (envelope) {
        envelope.trigger(time);
    });
};
Voice.prototype.stop = function (time, callback) {
    this.stopTime = time;

    this.envelope.forEach(function (envelope) {
        envelope.release(time);
    });
    this.destroyCallback = callback;
    this.destroyTimer = setTimeout((function (osc) {
        return function () {
            osc.destroy();
        };
    }(this)), this.envelope[0].getReleaseDuration() * 1000 + 30);
};
module.exports = Voice;
