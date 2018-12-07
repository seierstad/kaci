import {
    arrayOf,
    bool,
    number,
    oneOf,
    shape,
    string
} from "prop-types";

import {CHANNELS as MIDI_CHANNELS} from "./constants";

export const midiPortShape = shape({
    "id": string.isRequired,
    "manufacturer": string.isRequired,
    "name": string.isRequired
});

export const midiChannelShape = oneOf(MIDI_CHANNELS);

export const midiShape = shape({
    "active": bool,
    "portId": string,
    "channel": midiChannelShape.isRequired,
    "ports": arrayOf(midiPortShape).isRequired
});

export const midiClockPlayStateShape = shape({
    "tempo": number,
    "sync": number,
    "quarterNoteDuration": number
});

