import {PropTypes} from "react";

import {MODULATION_SOURCE_MODE, MODULATION_SOURCE_TYPE, RANGE} from "./constants";
import {CHANNELS as MIDI_CHANNELS} from "./midiConstants";
import {waveforms, wrappers, noise} from "./waveforms";

export const polarityShape = PropTypes.oneOf(Object.values(RANGE));

export const keyboardLayoutShape = PropTypes.shape({
    "name": PropTypes.string.isRequired,
    "offset": PropTypes.number.isRequired,
    "map": PropTypes.arrayOf(PropTypes.number).isRequired
});

export const keyboardConfigShape = PropTypes.shape({
    "activeLayout": PropTypes.string.isRequired,
    "layouts": PropTypes.arrayOf(keyboardLayoutShape).isRequired
});

export const midiPortShape = PropTypes.shape({
    "id": PropTypes.string.isRequired,
    "manufacturer": PropTypes.string.isRequired,
    "name": PropTypes.string.isRequired
});

export const midiChannelShape = PropTypes.oneOf(MIDI_CHANNELS);

export const midiShape = PropTypes.shape({
    "portId": PropTypes.string,
    "channel": midiChannelShape.isRequired,
    "ports": PropTypes.arrayOf(midiPortShape).isRequired
});

export const midiClockPlayStateShape = PropTypes.shape({
    "tempo": PropTypes.number,
    "sync": PropTypes.number,
    "quarterNoteDuration": PropTypes.number
});

export const temperedScaleShape = PropTypes.shape({
    "type": PropTypes.oneOf(["tempered"]),
    "notes": PropTypes.number.isRequired,
    "baseNumber": PropTypes.number.isRequired
});

export const rationalScaleShape = PropTypes.shape({
    "type": PropTypes.oneOf(["rational"]),
    "ratios": PropTypes.arrayOf(PropTypes.number).isRequired,
    "baseKey": PropTypes.number.isRequired
});

export const scaleShape = PropTypes.oneOfType([temperedScaleShape, rationalScaleShape]);

export const tuningShape = PropTypes.shape({
    "baseFrequency": PropTypes.shape({
        "min": PropTypes.number.isRequired,
        "max": PropTypes.number.isRequired,
        "value": PropTypes.number.isRequired
    }).isRequired,
    "keys": PropTypes.shape({
        "min": PropTypes.number.isRequired,
        "max": PropTypes.number.isRequired
    }),
    "selectedScale": PropTypes.string.isRequired,
    "scales": PropTypes.arrayOf(scaleShape)
});

export const connectionShape = PropTypes.shape({
    "default": PropTypes.shape({
        "enabled": PropTypes.bool.isRequired,
        "polarity": polarityShape,
        "amount": PropTypes.number.isRequired
    })
});

export const rangeShape = PropTypes.shape({
    "exponential": PropTypes.bool,
    "max": PropTypes.number.isRequired,
    "mid": PropTypes.number,
    "min": PropTypes.number.isRequired,
    "step": PropTypes.number
});

export const modulatorTypeShape = PropTypes.oneOf(Object.values(MODULATION_SOURCE_TYPE));

export const modulatorShape = PropTypes.shape({
    "index": PropTypes.number.isRequired,
    "type": modulatorTypeShape.isRequired
});

export const modulationConnectionPatchShape = PropTypes.shape({
    "amount": PropTypes.number.isRequired,
    "enabled": PropTypes.bool,
    "polarity": polarityShape.isRequired,
    "source": modulatorShape.isRequired
});
export const modulationTargetParameterShape = PropTypes.arrayOf(modulationConnectionPatchShape);

export const modulationTargetModuleShape = PropTypes.objectOf(modulationTargetParameterShape);

export const modulationPatchShape = PropTypes.shape({
    "oscillator": modulationTargetModuleShape,
    "sub": modulationTargetModuleShape,
    "noise": modulationTargetModuleShape,
    "vca": modulationTargetModuleShape
});

export const syncPatchShape = PropTypes.shape({
    "denominator": PropTypes.number.isRequired,
    "enabled": PropTypes.bool.isRequired,
    "numerator": PropTypes.number.isRequired
});

export const periodicModulatorPatchShape = PropTypes.shape({
    "frequency": PropTypes.number.isRequired,
    "sync": syncPatchShape
});

export const outputStagePatchProperties = {
    "active": PropTypes.bool.isRequired,
    "gain": PropTypes.number.isRequired,
    "pan": PropTypes.number.isRequired
};

export const outputStagePatchShape = PropTypes.shape({
    ...outputStagePatchProperties
});


export const subPatchShape = PropTypes.shape({
    "beat": PropTypes.number.isRequired,
    "beat_sync": syncPatchShape.isRequired,
    "depth": PropTypes.number.isRequired,
    "detune": PropTypes.number.isRequired,
    "mode": PropTypes.oneOf(["semitone", "beat"]).isRequired,
    ...outputStagePatchProperties
});

export const noisePatchShape = PropTypes.shape({
    "color": PropTypes.oneOf(Object.keys(noise)),
    ...outputStagePatchProperties
});

export const mainOutPatchShape = PropTypes.shape({
    ...outputStagePatchProperties
});

const modulatorModeShape = PropTypes.oneOf(Object.values(MODULATION_SOURCE_MODE));

const modulatorPatchProperties = {
    "active": PropTypes.bool.isRequired,
    "amount": PropTypes.number.isRequired,
    "mode": modulatorModeShape.isRequired
};

export const modulatorPatchShape = PropTypes.shape({
    ...modulatorPatchProperties
});

export const periodicPatchProperties = {
    "frequency": PropTypes.number.isRequired,
    "sync": syncPatchShape
};

export const lfoPatchShape = PropTypes.shape({
    ...modulatorPatchProperties,
    ...periodicPatchProperties,
    "waveform": PropTypes.string.isRequired
});

export const lfosPatchShape = PropTypes.arrayOf(lfoPatchShape);


export const morseGeneratorPatchShape = PropTypes.shape({
    ...modulatorPatchProperties,
    ...periodicPatchProperties,
    "text": PropTypes.string.isRequired
});

export const morseGeneratorsPatchShape = PropTypes.arrayOf(morseGeneratorPatchShape);

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

export const envelopePatchShape = PropTypes.arrayOf(envelopePointShape);

export const pdPatchShape = PropTypes.shape({
    "steps": envelopePatchShape.isRequired
});

export const oscillatorPdPatchShape = PropTypes.arrayOf(pdPatchShape);

export const envelopeStagePatchShape = PropTypes.shape({
    "steps": envelopePatchShape.isRequired,
    "duration": PropTypes.number.isRequired
});

export const sustainEnvelopePatchShape = PropTypes.shape({
    "attack": envelopeStagePatchShape.isRequired,
    "release": envelopeStagePatchShape.isRequired,
    "mode": modulatorModeShape.isRequired
});

export const envelopesPatchShape = PropTypes.arrayOf(sustainEnvelopePatchShape);

export const envelopeViewStateShape = PropTypes.array;

export const sustainEnvelopeViewStateShape = PropTypes.shape({
    "attack": envelopeViewStateShape.isRequired,
    "editSustain": PropTypes.bool.isRequired,
    "release": envelopeViewStateShape.isRequired
});

export const modulationEnvelopeSourcesShape = PropTypes.shape({
    "count": PropTypes.number.isRequired,
    "default": sustainEnvelopePatchShape.isRequired,
    "defaultState": sustainEnvelopeViewStateShape.isRequired
});

export const viewStateShape = PropTypes.shape({

});

export const syncConfigShape = PropTypes.shape({
    "numerator": rangeShape.isRequired,
    "denominator": rangeShape.isRequired
});

const modulatorConfigProperties = {
    "amount": rangeShape.isRequired,
    "count": PropTypes.number.isRequired
};

export const modulatorConfigShape = PropTypes.shape({
    ...modulatorConfigProperties
});

const periodicConfigProperties = {
    "frequency": rangeShape.isRequired,
    "sync": syncConfigShape
};

export const periodicModulatorsConfigShape = PropTypes.shape(periodicConfigProperties);

export const modulationLfoSourcesConfigShape = PropTypes.shape({
    ...modulatorConfigProperties,
    ...periodicConfigProperties,
    "default": lfoPatchShape
});

export const modulationMorseSourcesConfigShape = PropTypes.shape({
    ...modulatorConfigProperties,
    ...periodicConfigProperties,
    "default": morseGeneratorPatchShape
});

export const modulatorsConfigShape = PropTypes.shape({
    "envelope": modulationEnvelopeSourcesShape.isRequired,
    "lfo": modulationLfoSourcesConfigShape.isRequired,
    "morse": modulationMorseSourcesConfigShape.isRequired
});

export const outputTargetShape = PropTypes.shape({
    "gain": rangeShape.isRequired,
    "pan": rangeShape.isRequired
});

export const modulationTargetShape = PropTypes.objectOf(PropTypes.oneOfType([rangeShape, outputTargetShape]));

export const modulationTargetsConfigShape = PropTypes.shape({
    "noise": modulationTargetShape.isRequired,
    "oscillator": modulationTargetShape.isRequired,
    "sub": modulationTargetShape.isRequired,
    "main": modulationTargetShape.isRequired
});

export const modulationConfigShape = PropTypes.shape({
    "connection": connectionShape.isRequired,
    "source": modulatorsConfigShape.isRequired,
    "target": modulationTargetsConfigShape.isRequired
});

export const configurationShape = PropTypes.shape({
    "keyboard": keyboardConfigShape.isRequired,
    "midi": midiShape.isRequired,
    "modulation": modulationConfigShape.isRequired,
    "tuning": tuningShape.isRequired
});

export const wrapperPatchShape = PropTypes.oneOfType([
    PropTypes.oneOf(Object.keys(wrappers)),
    PropTypes.shape({
        "name": PropTypes.oneOf(Object.keys(wrappers)).isRequired,
        "parameters": PropTypes.object.isRequired
    })
]);

export const oscillatorPatchShape = PropTypes.shape({
    "detune": PropTypes.number.isRequired,
    "mix": PropTypes.number.isRequired,
    "pd": oscillatorPdPatchShape.isRequired,
    "resonance": PropTypes.number.isRequired,
    "resonanceActive": PropTypes.bool.isRequired,
    "waveform": PropTypes.oneOf(Object.keys(waveforms)),
    "wrapper": wrapperPatchShape.isRequired,
    ...outputStagePatchProperties
});

export const keyStateShape = PropTypes.shape({
    "down": PropTypes.bool,
    "number": PropTypes.number,
    "velocity": PropTypes.number,
    "aftertouch": PropTypes.number
});

export const chordShape = PropTypes.arrayOf(keyStateShape);

export const chordShiftShape = PropTypes.shape({
    "value": PropTypes.number.isRequired,
    "activeKeys": PropTypes.arrayOf(keyStateShape).isRequired,
    "chords": PropTypes.arrayOf(chordShape)
});

export const playStateShape = PropTypes.shape({
    "chordShift": chordShiftShape.isRequired,
    "hold": PropTypes.bool,
    "keys": PropTypes.arrayOf(keyStateShape).isRequired,
    "pitchShift": PropTypes.number.isRequired
});

export const keyViewPropsShape = PropTypes.shape({
    "handlers": PropTypes.shape({
        "down": PropTypes.func.isRequired,
        "up": PropTypes.func.isRequired
    }).isRequired,
    "keyNumber": PropTypes.number.isRequired,
    "keyWidth": PropTypes.number.isRequired,
    "noteName": PropTypes.string.isRequired,
    "playState": playStateShape,
    "x": PropTypes.string.isRequired
});

export const patchShape = PropTypes.shape({
    "main": mainOutPatchShape.isRequired,
    "oscillator": oscillatorPatchShape.isRequired,
    "noise": noisePatchShape.isRequired,
    "sub": subPatchShape.isRequired,
    "lfos": lfosPatchShape.isRequired,
    "envelopes": envelopesPatchShape.isRequired,
    "modulation": modulationPatchShape.isRequired
});
