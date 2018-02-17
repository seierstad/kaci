import autobind from "autobind-decorator";
import * as Actions from "./actions";
import * as c from "./midiConstants";


class MidiInput {
    constructor (store) {
        this.store = store;

        if (!navigator || typeof navigator.requestMIDIAccess !== "function") {
            this.store.dispatch({
                type: Actions.MIDI_UNAVAILABLE
            });
            return null;
        }

        this.state = store.getState().settings.midi;
        this.unsubscribe = this.store.subscribe(this.update);

        this.access = null;
        this.inputs = {};
        this.inputState = [];
        this.outputs = {};
        this.activeInputId = null;
        this.activeInput = null;
        this.activeChannel = this.state.channel || "all";
        this.clock = {
            ticks: [],
            tempo: null,
            sync: null,
            diff: 0
        };
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

        this.active = !!this.state.active;
    }

    set active (active) {
        if (active) {
            this.midiAccessRequest = navigator.requestMIDIAccess({
                "sysex": true
            }).then(this.midiAccessSuccess, this.midiAccessFailure);
        } else {
            console.log("TODO: disconnect MIDI access");
        }
    }

    @autobind
    update () {
        const state = this.store.getState().settings.midi;

        if (this.activeInputId !== state.selectedPort) {
            this.selectInputPort(state.selectedPort);
        }
        if (this.activeChannel !== state.channel) {
            this.selectChannel(state.channel);
        }
        if (this.state.active !== state.active) {
            this.active = state.active;
            this.state.active = state.active;
        }
    }

    @autobind
    accessStateChangeHandler (event) {
        const {port} = event;
        const {connection, name, id, manufacturer, state} = port;
        const value = {connection, name, id, manufacturer, state};
        const [is] = this.inputState.filter(p => p.id === id);

        if (is) {
            if (connection !== is.connection) {
                this.store.dispatch({type: Actions.MIDI_PORT_CONNECTION_CHANGE, value});
                is.connection = connection;
            }
            if (state !== is.state) {
                this.store.dispatch({type: Actions.MIDI_PORT_STATE_CHANGE, value});
                is.state = state;
            }
        } else {
            if (port.type === "input") {
                this.inputState.push(value);
                this.store.dispatch({
                    type: Actions.MIDI_ADD_INPUT_PORT,
                    value
                });
            }
        }

        if (id === this.state.selecedPort && state === c.PORT.STATE.CONNECTED) {
            this.selectInputPort(id);
        }
    }

    @autobind
    midiAccessFailure (exception) {
        console.log("MIDI failure: " + exception);
        this.store.dispatch({
            type: Actions.MIDI_UNAVAILABLE
        });
    }

    @autobind
    midiAccessSuccess (access) {
        this.midiAccess = access;
        this.midiAccess.addEventListener("statechange", this.accessStateChangeHandler);

        const inputIterator = access.inputs.entries();

        for (let [, port] of inputIterator) {
            this.inputs[port.id] = port;

            const {connection, name, id, manufacturer, state} = port;
            const value = {connection, name, id, manufacturer, state};
            this.inputState.push(value);

            this.store.dispatch({
                type: Actions.MIDI_ADD_INPUT_PORT,
                value
            });
        }

        this.selectInputPort(this.activeInputId || this.state.selectedPort);
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

    @autobind
    controlChangeHandler (type, data) {
        let cc = c.CONTROL,
            p = this.valuePairs;

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

    @autobind
    timeCodeHandler (data) {
        console.log("TODO: implement timecode");
    }

    @autobind
    clockHandler (time) {

        if (this.clock.sync) {
            this.clock.ticks.push(time - this.clock.sync);
        }
        this.clock.sync = time;

        const TICKS = 48;
        const REMOVE_LOW = 8;
        const REMOVE_HIGH = 8;

        if (this.clock.ticks.length > TICKS) {
            this.clock.ticks.shift();

            const diff = [...this.clock.ticks].sort((a, b) => a - b).slice(REMOVE_LOW, TICKS - REMOVE_HIGH).reduce((a, b) => a + b) / (TICKS - REMOVE_LOW - REMOVE_HIGH);


            if (diff !== this.clock.diff) {
                this.clock.diff = diff;

                // tempo changed (or unprecise clock...)
                const tempo = Math.floor(2500 / diff);
                if (tempo !== this.clock.tempo) {
                    this.clock.tempo = tempo;

                    this.store.dispatch({
                        "type": Actions.MIDI_TEMPO_CHANGE,
                        "tempo": this.clock.tempo,
                        "sync": this.clock.sync,
                        "quarterNoteDuration": diff * 24
                    });
                }
            }
        }
    }

    @autobind
    isActiveChannel (firstByte) {
        return (firstByte & 0xF0 === 0xF0) || (this.activeChannel === firstByte & 0x0F) || (typeof this.activeChannel === "string" && this.activeChannel === "all");
    }

    @autobind
    activeChannelMessageHandler (event, overrideType) {
        const {data, timeStamp} = event;
        let index = 0,
            type = data[0];

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
                switch (type) {
                    case c.SYSEX_TYPE.TIME_CODE:
                        this.timeCodeHandler(data);
                        break;
                    case c.SYSEX_TYPE.CLOCK:
                        this.clockHandler(timeStamp);
                }
                break;
            default: // same as last message (running status)
                if (this.runningStatusBuffer) {
                    this.activeChannelMessageHandler(data, type);
                }
        }

    }

    @autobind
    midiMessageHandler (event) {
        if (this.isActiveChannel(event.data[0])) {
            this.activeChannelMessageHandler(event);
        }
    }

    @autobind
    removeInputListeners (port) {
        if (port) {
            port.removeEventListener("midimessage", this.midiMessageHandler);
        }
    }

    @autobind
    addInputListeners (port) {
        if (port) {
            port.addEventListener("midimessage", this.midiMessageHandler, false);
        }
    }

    @autobind
    selectInputPort (portId) {
        if (this.activeInput && this.activeInputId !== portId) {
            this.activeInput.close();
            this.removeInputListeners(this.activeInput);
            this.activeInput = null;
            this.activeInputId = "";

        }
        if (portId && this.inputs[portId]) {
            this.activeInputId = portId;
            this.activeInput = this.inputs[portId];
            this.activeInput.open();
            this.addInputListeners(this.activeInput);
        }
    }

    selectChannel (channel) {
        if (this.activeChannel !== channel) {
            this.activeChannel = channel;
        }
    }
}

export default MidiInput;
