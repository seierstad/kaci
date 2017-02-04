import {PropTypes} from "react";

import {CHANNELS as MIDI_CHANNELS} from "./midiConstants";
import {waveforms, wrappers} from "./waveforms";

export const polarityShape = PropTypes.oneOf([
    "positive",
    "full",
    "negative"
]);

export const keyboardLayoutShape = PropTypes.shape({
    "name": PropTypes.string.isRequired,
    "offset": PropTypes.number.isRequired,
    "map": PropTypes.arrayOf(PropTypes.number).isRequired
});

export const keyboardShape = PropTypes.shape({
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

export const tuningShape = PropTypes.shape({
    "baseFrequency": PropTypes.shape({
        "min": PropTypes.number.isRequired,
        "max": PropTypes.number.isRequired,
        "value": PropTypes.number.isRequired
    }).isRequired,
    "scale": PropTypes.shape({
        "type": PropTypes.string
    })
});

export const connectionShape = PropTypes.shape({
    "default": PropTypes.shape({
        "enabled": PropTypes.bool.isRequired,
        "polarity": polarityShape,
        "amount": PropTypes.number.isRequired
    })
});

export const steppedRangeShape = PropTypes.shape({
    "min": PropTypes.number.isRequired,
    "max": PropTypes.number.isRequired,
    "step": PropTypes.number.isRequired
});

export const modulationSourceTypeShape = PropTypes.oneOf([
    "env",
    "lfo"
]);

export const modulationSourceShape = PropTypes.shape({
    "index": PropTypes.number.isRequired,
    "type": modulationSourceTypeShape.isRequired
});

export const modulationConnectionPatchDataShape = PropTypes.shape({
    "amount": PropTypes.number.isRequired,
    "enabled": PropTypes.bool,
    "polarity": polarityShape.isRequired,
    "source": modulationSourceShape.isRequired
});
export const modulationTargetParameterShape = PropTypes.arrayOf(modulationConnectionPatchDataShape);

export const modulationTargetModuleShape = PropTypes.objectOf(modulationTargetParameterShape);

export const modulationPatchDataShape = PropTypes.shape({
    "oscillator": modulationTargetModuleShape,
    "sub": modulationTargetModuleShape,
    "noise": modulationTargetModuleShape,
    "vca": modulationTargetModuleShape
});

export const syncPatchDataShape = PropTypes.shape({
    "denominator": PropTypes.number.isRequired,
    "enabled": PropTypes.bool.isRequired,
    "numerator": PropTypes.number.isRequired
});

export const subPatchDataShape = PropTypes.shape({
    "active": PropTypes.bool.isRequired,
    "beat": PropTypes.number.isRequired,
    "beat_sync": syncPatchDataShape.isRequired,
    "depth": PropTypes.number.isRequired,
    "detune": PropTypes.number.isRequired,
    "gain": PropTypes.number.isRequired,
    "mode": PropTypes.oneOf(["detune", "beat"]).isRequired,
    "pan": PropTypes.number.isRequired
});

export const noisePatchDataShape = PropTypes.shape({
    "active": PropTypes.bool.isRequired,
    "gain": PropTypes.number.isRequired,
    "pan": PropTypes.number.isRequired
});

const modulationSourceModeShape = PropTypes.oneOf(["global", "voice"]);

export const lfoPatchDataShape = PropTypes.shape({
    "active": PropTypes.bool.isRequired,
    "amount": PropTypes.number.isRequired,
    "frequency": PropTypes.number.isRequired,
    "mode": modulationSourceModeShape.isRequired,
    "sync": syncPatchDataShape,
    "waveform": PropTypes.string.isRequired
});

export const lfosPatchDataShape = PropTypes.arrayOf(lfoPatchDataShape);

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

export const envelopePatchDataShape = PropTypes.arrayOf(envelopePointShape);

export const pdPatchDataShape = PropTypes.shape({
    "steps": envelopePatchDataShape.isRequired
});

export const oscillatorPdPatchDataShape = PropTypes.arrayOf(pdPatchDataShape);

export const envelopeStagePatchDataShape = PropTypes.shape({
    "steps": envelopePatchDataShape.isRequired,
    "duration": PropTypes.number.isRequired
});

export const sustainEnvelopePatchDataShape = PropTypes.shape({
    "attack": envelopeStagePatchDataShape.isRequired,
    "release": envelopeStagePatchDataShape.isRequired,
    "mode": modulationSourceModeShape.isRequired
});

export const envelopesPatchDataShape = PropTypes.arrayOf(sustainEnvelopePatchDataShape);

export const envelopeViewStateShape = PropTypes.array;

export const sustainEnvelopeViewStateShape = PropTypes.shape({
    "attack": envelopeViewStateShape.isRequired,
    "editSustain": PropTypes.bool.isRequired,
    "release": envelopeViewStateShape.isRequired
});

export const modulationEnvelopeSourcesShape = PropTypes.shape({
    "count": PropTypes.number.isRequired,
    "default": sustainEnvelopePatchDataShape.isRequired,
    "defaultState": sustainEnvelopeViewStateShape.isRequired
});

export const viewStateShape = PropTypes.shape({

});

export const modulationLfoSourcesSyncShape = PropTypes.shape({
    "numerator": steppedRangeShape.isRequired,
    "denominator": steppedRangeShape.isRequired
});

export const modulationLfoSourcesShape = PropTypes.shape({
    "amount": steppedRangeShape.isRequired,
    "count": PropTypes.number.isRequired,
    "default": lfoPatchDataShape.isRequired,
    "frequency": steppedRangeShape.isRequired,
    "sync": modulationLfoSourcesSyncShape
});

export const modulationSourcesShape = PropTypes.shape({
    "envelopes": modulationEnvelopeSourcesShape.isRequired,
    "lfos": modulationLfoSourcesShape.isRequired
});

export const inputRangeShape = PropTypes.shape({
    "max": PropTypes.number.isRequired,
    "min": PropTypes.number.isRequired
});

export const modulationTargetShape = PropTypes.objectOf(inputRangeShape.isRequired);

export const modulationTargetsShape = PropTypes.shape({
    "noise": modulationTargetShape.isRequired,
    "oscillator": modulationTargetShape.isRequired,
    "sub": modulationTargetShape.isRequired,
    "vca": modulationTargetShape.isRequired
});

export const modulationShape = PropTypes.shape({
    "connection": connectionShape.isRequired,
    "source": modulationSourcesShape.isRequired,
    "target": modulationTargetsShape.isRequired
});

export const configurationShape = PropTypes.shape({
    "keyboard": keyboardShape.isRequired,
    "midi": midiShape.isRequired,
    "modulation": modulationShape.isRequired,
    "tuning": tuningShape.isRequired
});


export const oscillatorPatchDataShape = PropTypes.shape({
    "detune": PropTypes.number.isRequired,
    "mix": PropTypes.number.isRequired,
    "pan": PropTypes.number.isRequired,
    "pd": oscillatorPdPatchDataShape.isRequired,
    "resonance": PropTypes.number.isRequired,
    "resonanceActive": PropTypes.bool.isRequired,
    "waveform": PropTypes.oneOf(Object.keys(waveforms)),
    "wrapper": PropTypes.oneOf(Object.keys(wrappers))
});

export const keyStateShape = PropTypes.shape({
    "down": PropTypes.bool
});

export const playStateShape = PropTypes.shape({
    "chordShift": PropTypes.number.isRequired,
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
    "playState": keyStateShape,
    "x": PropTypes.string.isRequired
});

export const patchShape = PropTypes.shape({
    "oscillator": oscillatorPatchDataShape.isRequired,
    "noise": noisePatchDataShape.isRequired,
    "sub": subPatchDataShape.isRequired,
    "lfos": lfosPatchDataShape.isRequired,
    "envelopes": envelopesPatchDataShape.isRequired,
    "modulation": modulationPatchDataShape.isRequired
});
