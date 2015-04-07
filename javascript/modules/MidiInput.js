/* global require, document */
var c = require('./midiConstants');

var MidiInput = function (context, settings) {
    "use strict";
    var midiAccessFailure,
        midiAccessSuccess,
        that = this;

    this.access = null;
    this.inputs = {};
    this.outputs = {};
    this.activeInputId = settings.portId || null;
    this.activeInput = null;
    this.activeChannel = (typeof settings.channel === "number") ? settings.channel : null;
    this.runningStatusBuffer = null;
    this.valuePairs = {
        "BANK_SELECT": {
            "coarse": null,
            "fine": null
        },
        "MODULATION_WHEEL": {
            "coarse": null,
            "fine": null
        },
        "BREATH_CONTROLLER": {
            "coarse": null,
            "fine": null
        },
        "FOOT_PEDAL": {
            "coarse": null,
            "fine": null
        },
        "PORTAMENTO_TIME": {
            "coarse": null,
            "fine": null
        },
        "DATA_ENTRY": {
            "coarse": null,
            "fine": null
        },
        "VOLUME": {
            "coarse": null,
            "fine": null
        },
        "BALANCE": {
            "coarse": null,
            "fine": null
        },
        "PAN_POSITION": {
            "coarse": null,
            "fine": null
        },
        "EXPRESSION": {
            "coarse": null,
            "fine": null
        },
        "EFFECT_CONTROL_1": {
            "coarse": null,
            "fine": null
        },
        "EFFECT_CONTROL_2": {
            "coarse": null,
            "fine": null
        }
    };



    midiAccessFailure = function (exception) {
        console.log('MIDI failure');
    };
    midiAccessSuccess = function (access, options) {
        console.log('MIDI success');
        var input,
            inputIterator;

        inputIterator = access.inputs.entries();
        input = inputIterator.next();
        while (!input.done) {
            that.inputs[input.value[0]] = input.value[1];
            input = inputIterator.next();
        }
        context.dispatchEvent(new CustomEvent('midi.ports.added', {
            'detail': {
                'ports': that.inputs,
                'source': 'midi'
            }
        }));
        selectInputPortHandler.call(this, {
            detail: that.activeInputId
        });
    };
    var controlChangeHandler = function controlChangeHandler(event) {

    };
    var sendControlChangeEvent = function sendControlChangeEvent(controlName, value) {
        context.dispatchEvent(new CustomEvent('midi.control.change.' + controlName, {
            'detail': {
                'value': value
            }
        }));
    };
    var isActiveChannel = function isActiveChannel(firstByte) {
        return (firstByte & 0x0F === this.activeChannel) || (typeof this.activeChannel === 'string' && this.activeChannel === 'all');
    };
    var activeChannelMessageHandler = function activeChannelMessageHandler(data, overrideType) {
        var type = data[0],
            index = 0;

        if (overrideType) {
            type = overrideType;
            index = -1;
        }
        switch (type & 0xF0) {
        case c.MESSAGE_TYPE.NOTE_OFF: // note off
            this.runningStatusBuffer = type;
            context.dispatchEvent(new CustomEvent('keyboard.keyup', {
                'detail': {
                    'keyNumber': data[index + 1],
                    'velocity': data[index + 2],
                    'source': 'midi'
                }
            }));
            break;
        case c.MESSAGE_TYPE.NOTE_ON: // note on
            this.runningStatusBuffer = type;
            context.dispatchEvent(new CustomEvent('keyboard.keydown', {
                'detail': {
                    'keyNumber': data[index + 1],
                    'velocity': data[index + 2],
                    'source': 'midi'
                }
            }));
            break;
        case c.MESSAGE_TYPE.POLY_PRESSURE: // poly pressure
            this.runningStatusBuffer = type;
            break;
        case c.MESSAGE_TYPE.CONTROL_CHANGE: // control change
            this.runningStatusBuffer = type;
            controlChangeHandler(type, data);
            break;
        case c.MESSAGE_TYPE.PROGRAM_CHANGE: // program change
            this.runningStatusBuffer = type;
            break;
        case c.MESSAGE_TYPE.CHANNEL_PRESSURE: // channel pressure
            this.runningStatusBuffer = type;
            break;
        case c.MESSAGE_TYPE.PITCH_BEND: // pitch bend
            this.runningStatusBuffer = type;
            break;
        case c.MESSAGE_TYPE.SYSTEM_EXCLUSIVE: // system exclusive
            if (type < 0xF8) {
                this.runningStatusBuffer = null;
            }
            break;
        default: // same as last message (running status)
            if (this.runningStatusBuffer) {
                activeChannelMessageHandler(data, type);
            }
        }

    };
    var midiMessageHandler = function (event) {
        if (isActiveChannel(event.data[0])) {
            activeChannelMessageHandler(event.data);
        }
    };
    var midiHandler = midiMessageHandler.bind(this);
    var removeInputListeners = function (port) {
        port.removeEventListener('midimessage', midiHandler);
    };
    var addInputListeners = function (port) {
        port.addEventListener('midimessage', midiHandler, false);
    };
    var selectInputPortHandler = function (event) {
        var portId = event.detail;
        if (that.activeInput && that.activeInput.id !== portId) {
            removeInputListeners(that.activeInput);
        }
        if (portId && that.inputs[portId]) {
            that.activeInputId = portId;
            that.activeInput = that.inputs[portId];
            addInputListeners(that.activeInput);
            context.dispatchEvent(new CustomEvent('system.midi.port.selected', {
                "detail": that.activeInputId
            }));
        }
    };
    context.addEventListener('midi.select.input.port', selectInputPortHandler.bind(this));

    if (navigator && navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
            'sysex': true
        }).then(midiAccessSuccess, midiAccessFailure);
    } else {
        console.log('no midi');
        context.dispatchEvent(new CustomEvent('system.feature.missing.midi', {}));
    }
};

module.exports = MidiInput;
