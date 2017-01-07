/* global navigator */
import * as Actions from "./Actions.jsx";

let c = require("./midiConstants");

class MidiInput {
    constructor (store) {
        this.midiAccessSuccess = this.midiAccessSuccess.bind(this);
        this.midiAccessFailure = this.midiAccessFailure.bind(this);
        this.activeChannelMessageHandler = this.activeChannelMessageHandler.bind(this);
        this.isActiveChannel = this.isActiveChannel.bind(this);
        this.midiMessageHandler = this.midiMessageHandler.bind(this);
        this.removeInputListeners = this.removeInputListeners.bind(this);
        this.addInputListeners = this.addInputListeners.bind(this);
        this.selectInputPort = this.selectInputPort.bind(this);

        this.store = store;
        this.state = store.getState().settings.midi;

        const update = () => {
            const state = store.getState().settings.midi;

            if (this.activeInputId !== state.portId) {
                this.selectInputPort(state.portId);
            }
        };

        this.store.subscribe(update);
        this.access = null;
        this.inputs = {};
        this.outputs = {};
        this.activeInputId = this.state.portId || null;
        this.activeInput = null;
        this.activeChannel = (typeof this.state.channel === "number" || (typeof this.state.channel === "string" && this.state.channel === "all")) ? this.state.channel : null;
        this.runningStatusBuffer = null;
        this.valuePairs = {
            "BANK_SELECT": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_BANK_SELECT
            },
            "MODULATION_WHEEL": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_MODULATION_WHEEL
            },
            "BREATH_CONTROLLER": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_BREATH_CONTROLLER
            },
            "FOOT_PEDAL": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_FOOT_PEDAL
            },
            "PORTAMENTO_TIME": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_PORTAMENTO_TIME
            },
            "DATA_ENTRY": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_DATA_ENTRY
            },
            "VOLUME": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_VOLUME
            },
            "BALANCE": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_BALANCE
            },
            "PAN_POSITION": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_PAN_POSITION
            },
            "EXPRESSION": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_EXPRESSION
            },
            "EFFECT_CONTROL_1": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_EFFECT_CONTROL_1
            },
            "EFFECT_CONTROL_2": {
                "coarse": null,
                "fine": null,
                "action": Actions.MIDI_EFFECT_CONTROL_2
            }
        };

        if (navigator && navigator.requestMIDIAccess) {
            this.midiAccessRequest = navigator.requestMIDIAccess({
                "sysex": true
            }).then(this.midiAccessSuccess, this.midiAccessFailure);
        } else {
            this.store.dispatch({
                type: Actions.MIDI_UNAVAILABLE
            });
        }
    }

    midiAccessFailure (exception) {
        console.log("MIDI failure: " + exception);
        this.store.dispatch({
            type: Actions.MIDI_UNAVAILABLE
        });
    }

    midiAccessSuccess (access) {
        this.midiAccess = access;
        this.midiAccess.addEventListener("statechange", (event) => console.log(event));

        const inputIterator = access.inputs.entries();

        for (let [id, port] of inputIterator) {
            this.inputs[id] = port;

            this.store.dispatch({
                type: Actions.MIDI_ADD_INPUT_PORT,
                value: {
                    "name": port.name,
                    "id": port.id,
                    "manufacturer": port.manufacturer
                }
            });
        }

        this.selectInputPort(this.activeInputId);
    }

    updatePair (pair, coarse, fine) {
        let changed = false,
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
            this.store.dispatch({
                "type": pair.action,
                "coarse": pair.coarse,
                "fine": pair.fine,
                "MIDIvalue": combinedValue,
                "value": pair.fine === null ? pair.coarse / 0x7f : combinedValue / 0x3FFF
            });
        }
    }

    controlChangeHandler (type, data) {
        let p = this.valuePairs,
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
    }

    isActiveChannel (firstByte) {
        return (this.activeChannel === firstByte & 0x0F) || (typeof this.activeChannel === "string" && this.activeChannel === "all");
    }

    activeChannelMessageHandler (data, overrideType) {
        let type = data[0],
            index = 0;

        if (overrideType) {
            type = overrideType;
            index = -1;
        }

        const byte1 = data[index + 1];
        const byte2 = data[index + 2];

        switch (type & 0xF0) {
            case c.MESSAGE_TYPE.NOTE_OFF: // note off
                this.runningStatusBuffer = type;
                this.store.dispatch({
                    "type": Actions.MIDI_KEY_UP,
                    "keyNumber": byte1,
                    "velocity": byte2
                });
                break;
            case c.MESSAGE_TYPE.NOTE_ON: // note on
                this.runningStatusBuffer = type;
                this.store.dispatch({
                    "type": Actions.MIDI_KEY_DOWN,
                    "keyNumber": byte1,
                    "velocity": byte2
                });
                break;
            case c.MESSAGE_TYPE.POLY_PRESSURE: // poly pressure
                this.runningStatusBuffer = type;
                break;
            case c.MESSAGE_TYPE.CONTROL_CHANGE: // control change
                this.runningStatusBuffer = type;
                this.controlChangeHandler(byte1, byte2);
                break;
            case c.MESSAGE_TYPE.PROGRAM_CHANGE: // program change
                this.runningStatusBuffer = type;
                break;
            case c.MESSAGE_TYPE.CHANNEL_PRESSURE: // channel pressure
                this.runningStatusBuffer = type;
                break;
            case c.MESSAGE_TYPE.PITCH_BEND: // pitch bend

            // TODO: scale values above 0x2000 so that coarse=127, fine=127 => value=1
                this.runningStatusBuffer = type;
                const value = data[index + 2] << 7 | data[index + 1];

                this.store.dispatch({
                    "type": Actions.MIDI_PITCHBEND,
                    "fine": byte1,
                    "coarse": byte2,
                    "MIDIvalue": value,
                    "value": value <= 0x2000 ? value / 0x2000 - 1 : 2 * value / 0x3FFF - 1,
                    "source": "midi"

                });

                break;
            case c.MESSAGE_TYPE.SYSTEM_EXCLUSIVE: // system exclusive
                if (type < 0xF8) {
                    this.runningStatusBuffer = null;
                }
                break;
            default: // same as last message (running status)
                if (this.runningStatusBuffer) {
                    this.activeChannelMessageHandler(data, type);
                }
        }

    }

    midiMessageHandler (event) {
        if (this.isActiveChannel(event.data[0])) {
            this.activeChannelMessageHandler(event.data);
        }
    }

    removeInputListeners (port) {
        port.removeEventListener("midimessage", this.midiMessageHandler);
    }

    addInputListeners (port) {
        port.addEventListener("midimessage", this.midiMessageHandler, false);
    }

    selectInputPort (portId) {
        if (this.activeInput && this.activeInput.id !== portId) {
            this.removeInputListeners(this.activeInput);
        }
        if (portId && this.inputs[portId]) {
            this.activeInputId = portId;
            this.activeInput = this.inputs[portId];
            this.addInputListeners(this.activeInput);
        }
    }
}

export default MidiInput;
