/* global require, document, navigator, CustomEvent */
var c = require("./midiConstants");

var MidiInput = function (context, settings) {
    "use strict";
    var midiAccessFailure,
        midiAccessSuccess,
        that = this,
        controlChangeHandler,
        pitchBendHandler,
        isActiveChannel,
        activeChannelMessageHandler,
        midiMessageHandler,
        midiHandler,
        removeInputListeners,
        addInputListeners,
        selectInputPortHandler;

    this.access = null;
    this.inputs = {};
    this.outputs = {};
    this.activeInputId = settings.portId || null;
    this.activeInput = null;
    this.activeChannel = (typeof settings.channel === "number" || (typeof settings.channel === "string" && settings.channel === "all")) ? settings.channel : null;
    this.runningStatusBuffer = null;
    this.valuePairs = {
        "BANK_SELECT": {
            "coarse": null,
            "fine": null,
            "eventName": "bankSelect"
        },
        "MODULATION_WHEEL": {
            "coarse": null,
            "fine": null,
            "eventName": "modulationWheel"
        },
        "BREATH_CONTROLLER": {
            "coarse": null,
            "fine": null,
            "eventName": "breathController"
        },
        "FOOT_PEDAL": {
            "coarse": null,
            "fine": null,
            "eventName": "footPedal"
        },
        "PORTAMENTO_TIME": {
            "coarse": null,
            "fine": null,
            "eventName": "portamentoTime"
        },
        "DATA_ENTRY": {
            "coarse": null,
            "fine": null,
            "eventName": "dataEntry"
        },
        "VOLUME": {
            "coarse": null,
            "fine": null,
            "eventName": "volume"
        },
        "BALANCE": {
            "coarse": null,
            "fine": null,
            "eventName": "balance"
        },
        "PAN_POSITION": {
            "coarse": null,
            "fine": null,
            "eventName": "panPosition"
        },
        "EXPRESSION": {
            "coarse": null,
            "fine": null,
            "eventName": "expression"
        },
        "EFFECT_CONTROL_1": {
            "coarse": null,
            "fine": null,
            "eventName": "effectControl1"
        },
        "EFFECT_CONTROL_2": {
            "coarse": null,
            "fine": null,
            "eventName": "effectControl2"
        }
    };


    midiAccessFailure = function (exception) {
        console.log("MIDI failure: " + exception);
    };

    midiAccessSuccess = function (access) {
        var input,
            inputIterator;

        inputIterator = access.inputs.entries();
        input = inputIterator.next();
        while (!input.done) {
            that.inputs[input.value[0]] = input.value[1];
            input = inputIterator.next();
        }
        context.dispatchEvent(new CustomEvent("midi.ports.added", {
            "detail": {
                "ports": that.inputs,
                "source": "midi"
            }
        }));
        selectInputPortHandler.call(this, {
            detail: that.activeInputId
        });
    };
    this.updatePair = function (pair, coarse, fine) {
        var changed = false,
            combinedValue;

        if (!isNaN(coarse) && pair.coarse !== coarse) {
            pair.coarse = coarse;
            changed = true;
        }
        if (!isNaN(fine) && pair.fine !== fine) {
            pair.fine = fine;
            changed = true;
        }
        if (changed && !isNaN(pair.coarse)) {
            combinedValue = pair.coarse << 7 | (pair.fine || 0);

            context.dispatchEvent(new CustomEvent(pair.eventName + ".change", {
                "detail": {
                    "coarse": pair.coarse,
                    "fine": pair.fine,
                    "MIDIvalue": combinedValue,
                    "value": pair.fine === null ? pair.coarse / 0x7f : combinedValue / 0x3FFF,
                    "source": "midi"
                }
            }));
        }
    };

    this.controlChangeHandler = function controlChangeHandler(type, data) {
        var p = this.valuePairs,
            cc = c.CONTROL;

        switch (type) {
        case cc.BANK_SELECT_MSB:
            this.updatePair(p.BANK_SELECT, data, null);
            break;
        case cc.BANK_SELECT_LSB:
            this.updatePair(p.BANK_SELECT, null, data);
            break;
        case cc.MODULATION_WHEEL_MSB:
            this.updatePair(p.MODULATION_WHEEL, data, null);
            break;
        case cc.MODULATION_WHEEL_LSB:
            this.updatePair(p.MODULATION_WHEEL, null, data);
            break;
        case cc.BREATH_CONTROLLER_MSB:
            this.updatePair(p.BREATH_CONTROLLER, data, null);
            break;
        case cc.BREATH_CONTROLLER_LSB:
            this.updatePair(p.BREATH_CONTROLLER, null, data);
            break;
        case cc.FOOT_PEDAL_MSB:
            this.updatePair(p.FOOT_PEDAL, data, null);
            break;
        case cc.FOOT_PEDAL_LSB:
            this.updatePair(p.FOOT_PEDAL, null, data);
            break;
        case cc.PORTAMENTO_TIME_MSB:
            this.updatePair(p.PORTAMENTO_TIME, data, null);
            break;
        case cc.PORTAMENTO_TIME_LSB:
            this.updatePair(p.PORTAMENTO_TIME, null, data);
            break;
        case cc.DATA_ENTRY_MSB:
            this.updatePair(p.DATA_ENTRY, data, null);
            break;
        case cc.DATA_ENTRY_LSB:
            this.updatePair(p.DATA_ENTRY, null, data);
            break;
        case cc.VOLUME_MSB:
            this.updatePair(p.VOLUME, data, null);
            break;
        case cc.VOLUME_LSB:
            this.updatePair(p.VOLUME, null, data);
            break;
        case cc.BALANCE_MSB:
            this.updatePair(p.BALANCE, data, null);
            break;
        case cc.BALANCE_LSB:
            this.updatePair(p.BALANCE, null, data);
            break;
        case cc.PAN_POSITION_MSB:
            this.updatePair(p.PAN_POSITION, data, null);
            break;
        case cc.PAN_POSITION_LSB:
            this.updatePair(p.PAN_POSITION, null, data);
            break;
        case cc.EXPRESSION_MSB:
            this.updatePair(p.EXPRESSION, data, null);
            break;
        case cc.EXPRESSION_LSB:
            this.updatePair(p.EXPRESSION, null, data);
            break;
        case cc.EFFECT_CONTROL_1_MSB:
            this.updatePair(p.EFFECT_CONTROL, data, null);
            break;
        case cc.EFFECT_CONTROL_1_LSB:
            this.updatePair(p.EFFECT_CONTROL, null, data);
            break;
        case cc.EFFECT_CONTROL_2_MSB:
            this.updatePair(p.EFFECT_CONTROL, data, null);
            break;
        case cc.EFFECT_CONTROL_2_LSB:
            this.updatePair(p.EFFECT_CONTROL, null, data);
            break;
        default:
            console.log("unimplemented MIDI control change message received: " + type);
        }
    };

    isActiveChannel = function isActiveChannel(firstByte) {
        return (that.activeChannel === firstByte & 0x0F) || (typeof that.activeChannel === "string" && that.activeChannel === "all");
    };
    activeChannelMessageHandler = function activeChannelMessageHandler(data, overrideType) {
        var type = data[0],
            index = 0,
            value,
            byte1,
            byte2;

        if (overrideType) {
            type = overrideType;
            index = -1;
        }

        byte1 = data[index + 1];
        byte2 = data[index + 2];

        switch (type & 0xF0) {
        case c.MESSAGE_TYPE.NOTE_OFF: // note off
            that.runningStatusBuffer = type;
            context.dispatchEvent(new CustomEvent("keyboard.keyup", {
                "detail": {
                    "keyNumber": byte1,
                    "velocity": byte2,
                    "source": "midi"
                }
            }));
            break;
        case c.MESSAGE_TYPE.NOTE_ON: // note on
            that.runningStatusBuffer = type;
            context.dispatchEvent(new CustomEvent("keyboard.keydown", {
                "detail": {
                    "keyNumber": byte1,
                    "velocity": byte2,
                    "source": "midi"
                }
            }));
            break;
        case c.MESSAGE_TYPE.POLY_PRESSURE: // poly pressure
            that.runningStatusBuffer = type;
            break;
        case c.MESSAGE_TYPE.CONTROL_CHANGE: // control change
            that.runningStatusBuffer = type;
            that.controlChangeHandler(byte1, byte2);
            break;
        case c.MESSAGE_TYPE.PROGRAM_CHANGE: // program change
            that.runningStatusBuffer = type;
            break;
        case c.MESSAGE_TYPE.CHANNEL_PRESSURE: // channel pressure
            that.runningStatusBuffer = type;
            break;
        case c.MESSAGE_TYPE.PITCH_BEND: // pitch bend

            // TODO: scale values above 0x2000 so that coarse=127, fine=127 => value=1
            that.runningStatusBuffer = type;
            value = data[index + 2] << 7 | data[index + 1];

            context.dispatchEvent(new CustomEvent("pitchBend.change", {
                "detail": {
                    "fine": byte1,
                    "coarse": byte2,
                    "MIDIvalue": value,
                    "value": value <= 0x2000 ? value / 0x2000 - 1 : 2 * value / 0x3FFF - 1,
                    "source": "midi"
                }
            }));

            break;
        case c.MESSAGE_TYPE.SYSTEM_EXCLUSIVE: // system exclusive
            if (type < 0xF8) {
                that.runningStatusBuffer = null;
            }
            break;
        default: // same as last message (running status)
            if (that.runningStatusBuffer) {
                activeChannelMessageHandler(data, type);
            }
        }

    };
    midiMessageHandler = function (event) {
        if (isActiveChannel(event.data[0])) {
            activeChannelMessageHandler(event.data);
        }
    };
    midiHandler = midiMessageHandler.bind(this);
    removeInputListeners = function (port) {
        port.removeEventListener("midimessage", midiHandler);
    };
    addInputListeners = function (port) {
        port.addEventListener("midimessage", midiHandler, false);
    };
    selectInputPortHandler = function (event) {
        var portId = event.detail;
        if (that.activeInput && that.activeInput.id !== portId) {
            removeInputListeners(that.activeInput);
        }
        if (portId && that.inputs[portId]) {
            that.activeInputId = portId;
            that.activeInput = that.inputs[portId];
            addInputListeners(that.activeInput);
            context.dispatchEvent(new CustomEvent("system.midi.port.selected", {
                "detail": that.activeInputId
            }));
        }
    };
    context.addEventListener("midi.select.input.port", selectInputPortHandler.bind(this));

    if (navigator && navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
            "sysex": true
        }).then(midiAccessSuccess, midiAccessFailure);
    } else {
        context.dispatchEvent(new CustomEvent("system.feature.missing.midi", {}));
    }
};

module.exports = MidiInput;