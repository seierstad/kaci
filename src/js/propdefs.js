import {PropTypes} from "prop-types";

import {
    MODULATION_SOURCE_MODE,
    MODULATION_SOURCE_TYPE,
    RANGE,
    OSCILLATOR_MODE,
    CHORD_SHIFT_MODE
} from "./constants";

import {CHANNELS as MIDI_CHANNELS} from "./midiConstants";
import {waveforms, wrappers, noise} from "./waveforms";

const {string, number, shape, oneOf, oneOfType, arrayOf, array, object, objectOf, func, bool} = PropTypes;


export const polarityShape = oneOf(Object.values(RANGE));

export const keyboardLayoutShape = shape({
    "name": string.isRequired,
    "offset": number.isRequired,
    "map": arrayOf(number).isRequired
});

export const keyboardConfigShape = shape({
    "activeLayout": string.isRequired,
    "layouts": arrayOf(keyboardLayoutShape).isRequired
});

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

export const temperedScaleShape = shape({
    "type": oneOf(["tempered"]),
    "notes": number.isRequired,
    "base": number.isRequired
});

const pow = arrayOf(number);
const fraction = arrayOf(oneOfType([number, pow]));
const ratioShape = oneOfType([number, fraction]);

export const rationalScaleShape = shape({
    "type": oneOf(["rational"]),
    "ratios": arrayOf(ratioShape).isRequired,
    "baseKey": number.isRequired
});

export const scaleShape = oneOfType([temperedScaleShape, rationalScaleShape]);

export const tuningShape = shape({
    "baseFrequency": shape({
        "min": number.isRequired,
        "max": number.isRequired,
        "value": number.isRequired
    }).isRequired,
    "keys": shape({
        "min": number.isRequired,
        "max": number.isRequired
    }),
    "scale": scaleShape.isRequired,
    "scales": arrayOf(scaleShape)
});

export const connectionShape = shape({
    "default": shape({
        "enabled": bool.isRequired,
        "polarity": polarityShape,
        "amount": number.isRequired
    })
});

export const rangeShape = shape({
    "exponential": bool,
    "max": number.isRequired,
    "mid": number,
    "min": number.isRequired,
    "step": number
});

export const modulatorTypeShape = oneOf(Object.values(MODULATION_SOURCE_TYPE));

export const modulatorShape = shape({
    "index": number.isRequired,
    "type": modulatorTypeShape.isRequired
});

export const modulationConnectionPatchShape = shape({
    "amount": number.isRequired,
    "enabled": bool,
    "polarity": polarityShape.isRequired,
    "source": modulatorShape.isRequired
});
export const modulationTargetParameterShape = arrayOf(modulationConnectionPatchShape);

export const modulationTargetModuleShape = objectOf(modulationTargetParameterShape);

export const modulationPatchShape = shape({
    "oscillator": modulationTargetModuleShape,
    "sub": modulationTargetModuleShape,
    "noise": modulationTargetModuleShape,
    "vca": modulationTargetModuleShape
});

export const syncPatchShape = shape({
    "denominator": number.isRequired,
    "enabled": bool.isRequired,
    "numerator": number.isRequired
});

export const periodicModulatorPatchShape = shape({
    "frequency": number.isRequired,
    "sync": syncPatchShape
});

export const outputStagePatchProperties = {
    "active": bool.isRequired,
    "gain": number.isRequired,
    "pan": number.isRequired
};

export const outputStagePatchShape = shape({
    ...outputStagePatchProperties
});


export const subPatchShape = shape({
    "beat": number.isRequired,
    "beat_sync": syncPatchShape.isRequired,
    "depth": number.isRequired,
    "detune": number.isRequired,
    "mode": oneOf(["semitone", "beat"]).isRequired,
    ...outputStagePatchProperties
});

export const noisePatchShape = shape({
    "color": oneOf(Object.keys(noise)),
    ...outputStagePatchProperties
});

export const mainOutPatchShape = shape({
    ...outputStagePatchProperties
});

const modulatorModeShape = oneOf(Object.values(MODULATION_SOURCE_MODE));

const modulatorPatchProperties = {
    "active": bool.isRequired,
    "amount": number.isRequired,
    "mode": modulatorModeShape.isRequired
};

export const modulatorPatchShape = shape({
    ...modulatorPatchProperties
});

export const periodicPatchProperties = {
    "frequency": number.isRequired,
    "sync": syncPatchShape
};

export const lfoPatchShape = shape({
    ...modulatorPatchProperties,
    ...periodicPatchProperties,
    "waveform": string.isRequired
});

export const lfosPatchShape = arrayOf(lfoPatchShape);


export const morseGeneratorPatchShape = shape({
    ...modulatorPatchProperties,
    ...periodicPatchProperties,
    "text": string.isRequired,
    "speedUnit": number,
    "shift": number,
    "padding": number,
    "fillToFit": bool
});

export const morseGeneratorsPatchShape = arrayOf(morseGeneratorPatchShape);

export const morseGeneratorViewStateShape = shape({
    "guides": arrayOf(number)
});

export const stepsPatchShape = shape({
    ...modulatorPatchProperties,
    ...periodicPatchProperties,
    "levels": number.isRequired,
    "steps": arrayOf(number).isRequired
});

const envelopePointShape = (props, propName, componentName) => {
    const prop = props[propName];
    if (!Array.isArray(prop)
        || prop.length !== 2
        || typeof prop[0] !== "number"
        || props[0] > 1
        || props[0] < 0
        || typeof prop[1] !== "number"
        || props[1] > 1
        || props[1] < 0
    ) {

        return new Error(
            "Invalid prop `" + propName + "` supplied to" +
            " `" + componentName + "`. Validation failed."
        );
    }
    return true;
};

export const envelopePatchShape = arrayOf(envelopePointShape);

export const pdPatchShape = shape({
    "steps": envelopePatchShape.isRequired
});

export const oscillatorPdPatchShape = arrayOf(pdPatchShape);

export const envelopeStagePatchShape = shape({
    "steps": envelopePatchShape.isRequired,
    "duration": number.isRequired
});

export const sustainEnvelopePatchShape = shape({
    "attack": envelopeStagePatchShape.isRequired,
    "release": envelopeStagePatchShape.isRequired,
    "mode": modulatorModeShape.isRequired
});

export const envelopesPatchShape = arrayOf(sustainEnvelopePatchShape);

export const envelopeViewStateShape = array;

export const sustainEnvelopeViewStateShape = shape({
    "attack": envelopeViewStateShape.isRequired,
    "editSustain": bool.isRequired,
    "release": envelopeViewStateShape.isRequired
});

export const modulationEnvelopeSourcesShape = shape({
    "count": number.isRequired,
    "default": sustainEnvelopePatchShape.isRequired,
    "defaultState": sustainEnvelopeViewStateShape.isRequired
});

export const viewStateShape = shape({
    "envelopes": arrayOf(sustainEnvelopeViewStateShape),
    "oscillator": shape({
        "pd": arrayOf(array)
    }),
    "morse": arrayOf(morseGeneratorViewStateShape)
});

export const syncConfigShape = shape({
    "numerator": rangeShape.isRequired,
    "denominator": rangeShape.isRequired
});

const modulatorConfigProperties = {
    "amount": rangeShape.isRequired,
    "count": number.isRequired
};

export const modulatorConfigShape = shape({
    ...modulatorConfigProperties
});

const periodicConfigProperties = {
    "frequency": rangeShape.isRequired,
    "sync": syncConfigShape
};

export const periodicModulatorsConfigShape = shape(periodicConfigProperties);

export const modulationLfoSourcesConfigShape = shape({
    ...modulatorConfigProperties,
    ...periodicConfigProperties,
    "default": lfoPatchShape
});

export const modulationMorseSourcesConfigShape = shape({
    ...modulatorConfigProperties,
    ...periodicConfigProperties,
    "default": morseGeneratorPatchShape
});

export const modulationStepsSourcesConfigShape = shape({
    ...modulatorConfigProperties,
    ...periodicConfigProperties,
    "default": stepsPatchShape
});

export const modulatorsConfigShape = shape({
    "envelope": modulationEnvelopeSourcesShape.isRequired,
    "lfo": modulationLfoSourcesConfigShape.isRequired,
    "morse": modulationMorseSourcesConfigShape.isRequired
});

export const outputTargetShape = shape({
    "gain": rangeShape.isRequired,
    "pan": rangeShape.isRequired
});

export const modulationTargetShape = objectOf(oneOfType([rangeShape, outputTargetShape]));

export const modulationTargetsConfigShape = shape({
    "noise": modulationTargetShape.isRequired,
    "oscillator": modulationTargetShape.isRequired,
    "sub": modulationTargetShape.isRequired,
    "main": modulationTargetShape.isRequired
});

export const modulationConfigShape = shape({
    "connection": connectionShape.isRequired,
    "source": modulatorsConfigShape.isRequired,
    "target": modulationTargetsConfigShape.isRequired
});

export const configurationShape = shape({
    "keyboard": keyboardConfigShape.isRequired,
    "midi": midiShape.isRequired,
    "modulation": modulationConfigShape.isRequired,
    "tuning": tuningShape.isRequired
});

export const wrapperPatchShape = oneOfType([
    oneOf(Object.keys(wrappers)),
    shape({
        "name": oneOf(Object.keys(wrappers)).isRequired,
        "parameters": object.isRequired
    })
]);

export const oscillatorModeShape = oneOf(Object.values(OSCILLATOR_MODE));

export const harmonicShape = shape({
    "denominator": number.isRequired,
    "level": number.isRequired,
    "numerator": number.isRequired
});


export const oscillatorPatchShape = shape({
    "detune": number.isRequired,
    "harmonics": arrayOf(harmonicShape),
    "mix": number.isRequired,
    "mode": oscillatorModeShape.isRequired,
    "pd": oscillatorPdPatchShape.isRequired,
    "resonance": number.isRequired,
    "waveform": oneOf(Object.keys(waveforms)),
    "wrapper": wrapperPatchShape.isRequired,
    ...outputStagePatchProperties
});

export const keyStateShape = shape({
    "down": bool,
    "number": number,
    "velocity": number,
    "aftertouch": number
});

export const chordShape = objectOf(keyStateShape);

export const chordShiftPlayStateShape = shape({
    "value": number.isRequired,
    "activeKeys": objectOf(keyStateShape).isRequired,
    "chords": arrayOf(chordShape)
});

export const playStateShape = shape({
    "chordShift": chordShiftPlayStateShape.isRequired,
    "hold": bool,
    "keys": objectOf(keyStateShape).isRequired,
    "pitchShift": number.isRequired
});

export const keyViewPropsShape = shape({
    "handlers": shape({
        "down": func.isRequired,
        "up": func.isRequired
    }).isRequired,
    "keyNumber": number.isRequired,
    "keyWidth": number.isRequired,
    "noteName": string.isRequired,
    "playState": playStateShape,
    "x": string.isRequired
});

export const patchShape = shape({
    "main": mainOutPatchShape.isRequired,
    "oscillator": oscillatorPatchShape.isRequired,
    "noise": noisePatchShape.isRequired,
    "sub": subPatchShape.isRequired,
    "lfos": lfosPatchShape.isRequired,
    "envelopes": envelopesPatchShape.isRequired,
    "modulation": modulationPatchShape.isRequired
});

const chordShiftModes = Object.values(CHORD_SHIFT_MODE);

export const chordShiftPatchShape = shape({
    "mode": oneOf(chordShiftModes).isRequired
});
