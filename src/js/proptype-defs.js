import {PropTypes} from "react";

import {waveforms, wrappers} from "./modules/waveforms";

export const polarity = PropTypes.oneOf([
    "positive",
    "full",
    "negative"
]);

export const keyboardLayout = PropTypes.shape({
    "name": PropTypes.string.isRequired,
    "offset": PropTypes.number.isRequired,
    "map": PropTypes.arrayOf(PropTypes.number).isRequired
});

export const keyboard = PropTypes.shape({
    "activeLayout": PropTypes.string.isRequired,
    "layouts": PropTypes.arrayOf(keyboardLayout).isRequired
});

export const midi = PropTypes.shape({
    "portId": PropTypes.string,
    "channel": PropTypes.oneOf(["all", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
    "ports": PropTypes.arrayOf(PropTypes.string)
});

export const tuning = PropTypes.shape({
    "baseFrequency": PropTypes.number.isRequired,
    "scale": PropTypes.shape({
        "type": PropTypes.string
    })
});

export const connection = PropTypes.shape({
    "default": PropTypes.shape({
        "enabled": PropTypes.bool.isRequired,
        "polarity": polarity,
        "amount": PropTypes.number.isRequired
    })
});

export const steppedRange = PropTypes.shape({
    "min": PropTypes.number.isRequired,
    "max": PropTypes.number.isRequired,
    "step": PropTypes.number.isRequired
});

export const modulationConnectionPatchData = PropTypes.shape({
    "amount": PropTypes.number.isRequired,
    "enabled": PropTypes.bool.isRequired,
    "polarity": polarity
});

export const modulationSourceType = PropTypes.oneOf([
    "envelopes",
    "lfos"
]);

export const modulationSourcePatchData = PropTypes.objectOf(modulationConnectionPatchData);

export const modulationPatchData = PropTypes.shape({
    "envelopes": PropTypes.arrayOf(modulationSourcePatchData),
    "lfos": PropTypes.arrayOf(modulationSourcePatchData)
});

export const subPatchData = PropTypes.shape({
    "active": PropTypes.bool.isRequired,
    "depth": PropTypes.number.isRequired,
    "gain": PropTypes.number.isRequired,
    "pan": PropTypes.number.isRequired
});

export const noisePatchData = PropTypes.shape({
    "active": PropTypes.bool.isRequired,
    "gain": PropTypes.number.isRequired,
    "pan": PropTypes.number.isRequired
});


export const syncPatchData = PropTypes.shape({
    "denominator": PropTypes.number.isRequired,
    "enabled": PropTypes.bool.isRequired,
    "numerator": PropTypes.number.isRequired
});

const modulationSourceMode = PropTypes.oneOf(["global", "voice"]);

export const lfoPatchData = PropTypes.shape({
    "active": PropTypes.bool.isRequired,
    "amount": PropTypes.number.isRequired,
    "frequency": PropTypes.number.isRequired,
    "mode": modulationSourceMode.required,
    "sync": syncPatchData,
    "waveform": PropTypes.string.isRequired
});

export const lfosPatchData = PropTypes.arrayOf(lfoPatchData);

const envelopePoint = (props, propName, componentName) => {
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

export const envelopePatchData = PropTypes.arrayOf(envelopePoint);

export const pdPatchData = PropTypes.shape({
    "steps": envelopePatchData.isRequired
});

export const oscillatorPdPatchData = PropTypes.arrayOf(pdPatchData);

export const envelopeStagePatchData = PropTypes.shape({
    "steps": envelopePatchData.isRequired,
    "duration": PropTypes.number.isRequired
});

export const sustainEnvelopePatchData = PropTypes.shape({
    "attack": envelopeStagePatchData.isRequired,
    "release": envelopeStagePatchData.isRequired,
    "mode": modulationSourceMode.isRequired
});

export const envelopesPatchData = PropTypes.arrayOf(sustainEnvelopePatchData);

export const envelopeViewState = PropTypes.array;

export const sustainEnvelopeViewState = PropTypes.shape({
    "attack": envelopeViewState.isRequired,
    "editSustain": PropTypes.bool.isRequired,
    "release": envelopeViewState.isRequired
});

export const modulationEnvelopeSources = PropTypes.shape({
    "count": PropTypes.number.isRequired,
    "default": sustainEnvelopePatchData.isRequired,
    "defaultState": sustainEnvelopeViewState.isRequired
});

export const modulationLfoSourcesSync = PropTypes.shape({
    "numerator": steppedRange.isRequired,
    "denominator": steppedRange.isRequired
});

export const modulationLfoSources = PropTypes.shape({
    "amount": steppedRange.isRequired,
    "count": PropTypes.number.isRequired,
    "default": lfoPatchData.isRequired,
    "frequency": steppedRange.isRequired,
    "sync": modulationLfoSourcesSync
});

export const modulationSources = PropTypes.shape({
    "envelopes": modulationEnvelopeSources.isRequired,
    "lfos": modulationLfoSources.isRequired
});

export const inputRange = PropTypes.shape({
    "max": PropTypes.number.isRequired,
    "min": PropTypes.number.isRequired
});

export const modulationTarget = PropTypes.objectOf(inputRange.isRequired);

export const modulationTargets = PropTypes.shape({
    "noise": modulationTarget.isRequired,
    "oscillator": modulationTarget.isRequired,
    "sub": modulationTarget.isRequired,
    "vca": modulationTarget.isRequired
});

export const modulation = PropTypes.shape({
    "connection": connection.isRequired,
    "source": modulationSources.isRequired,
    "target": modulationTargets.isRequired
});

export const configuration = PropTypes.shape({
    "keyboard": keyboard.isRequired,
    "midi": midi.isRequired,
    "modulation": modulation.isRequired,
    "tuning": tuning.isRequired
});


export const oscillatorPatchData = PropTypes.shape({
    "detune": PropTypes.number.isRequired,
    "mix": PropTypes.number.isRequired,
    "pan": PropTypes.number.isRequired,
    "pd": oscillatorPdPatchData.isRequired,
    "resonance": PropTypes.number.isRequired,
    "resonanceActive": PropTypes.bool.isRequired,
    "waveform": PropTypes.oneOf(Object.keys(waveforms)),
    "wrapper": PropTypes.oneOf(Object.keys(wrappers))
});

export const keyViewProps = PropTypes.shape({
    "handlers": PropTypes.shape({
        "down": PropTypes.func.isRequired,
        "up": PropTypes.func.isRequired
    }).isRequired,
    "keyNumber": PropTypes.number.isRequired,
    "keyWidth": PropTypes.number.isRequired,
    "noteName": PropTypes.string.isRequired,
    "playState": PropTypes.object,
    "x": PropTypes.string.isRequired
});

export const patch = PropTypes.shape({
    "oscillator": oscillatorPatchData.isRequired,
    "noise": noisePatchData.isRequired,
    "sub": subPatchData.isRequired,
    "lfos": lfosPatchData.isRequired,
    "envelopes": envelopesPatchData.isRequired,
    "modulation": modulationPatchData.isRequired
});
