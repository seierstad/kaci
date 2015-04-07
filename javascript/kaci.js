/** Require React itself */
/*globals require, console */
//"use strict";
var DCGenerator = require('./modules/DCGenerator');
var LFO = require('./modules/LFO');
var LFOView = require('./modules/LFOView');
var EnvelopeGenerator = require('./modules/EnvelopeGenerator');
var EnvelopeView = require('./modules/EnvelopeView');
var SustainEnvelopeView = require('./modules/SustainEnvelopeView');
var IdealOscillator = require('./modules/IdealOscillator');
var PDOscillator = require('./modules/PDOscillator');
var Voice = require('./modules/Voice');
var VoiceRegister = require('./modules/VoiceRegister');
//var WavyJones = require('./lib/WavyJones');
var OscillatorView = require('./modules/OscillatorView');
var Utils = require('./modules/Utils');
var KeyboardView = require('./modules/KeyboardView');
var KeyboardInput = require('./modules/KeyboardInput');
var BUFFER_LENGTH = 2048;
//var react = require('react');
var ctx, stop, scope, pd, lfo, lfo1, lfo1View, lfoGain, mix, res, voices = [],
    mainMix, dc, lfoOffset;
var patch = require('./modules/Patch');
var Midi = require('./modules/MidiInput');
var SystemSettings = require('./modules/SystemSettings');
var SystemSettingsView = require('./modules/SystemSettingsView');

var host = document.querySelector("#host");

if (window.webkitAudioContext) {
    window.AudioContext = window.webkitAudioContext;
}
if (window.AudioContext) {

    ctx = new window.AudioContext();
    dc = new DCGenerator(ctx);
    neioneio = ctx;
    var reg = new VoiceRegister(ctx);
    var tuning = reg.tunings.tempered;
    var system = new SystemSettings(ctx);

    var systemSettingsView = new SystemSettingsView(ctx, system.settings);

    document.body.appendChild(systemSettingsView);

    var midi = new Midi(ctx, system.settings.midi);

    var keyboardView = new KeyboardView(ctx, {
        startKey: 36,
        endKey: 73,
        className: "keyboard"
    });
    document.body.appendChild(keyboardView);
    var keyboardInput = new KeyboardInput(ctx, system.settings.keyboard);

    mainMix = ctx.createChannelMerger();
    mainMix.connect(ctx.destination);
    var lfo = [],
        lfoView = [],
        envelopeView = [];
    var i, j;

    for (i = 0, j = patch.lfo.length; i < j; i += 1) {
        lfo[i] = new LFO(ctx, patch.lfo[i], 'lfo' + i, {
            syncMaster: i === 0
        });
        lfo[i].addOutput("oscillatorDetune", 1200);
        lfo[i].addOutput("pdMix", 1);
        lfo[i].addOutput("resonance", 10);
        lfo[i] = lfo[i];
        lfoView[i] = new LFOView(ctx, lfo[i], patch.lfo[i], {
            lfoId: 'lfo' + i,
            syncControls: i > 0
        });
        document.body.appendChild(lfoView[i]);
    }

    /*
        scope = new WavyJones(ctx, 'oscilloscope');
        scope.lineColor = 'black';
        scope.lineThickness = 1;
        mainMix.connect(scope);
    */
    var ov = new OscillatorView(ctx, patch.oscillator);
    document.body.appendChild(ov);



    var voiceParameterHandler = function (mod, param) {
        return function (evt) {
            patch[mod][param] = evt.detail;
        };
    };
    var getEnvelopeEventListener = function (envelopeData, envelopeId) {
        return function (event) {
            var detail = event.detail;

            switch (event.detail.type) {
            case "add":
                envelopeData.splice(detail.index, 0, [detail.data.x, detail.data.y]);
                break;
            case "delete":
                envelopeData.splice(detail.index, 1);
                break;
            case "move":
                envelopeData[detail.index] = [detail.data.x, detail.data.y];
                break;
            default:
                envelopeData = detail;
                break;
            }
            detail.full = envelopeData;
            ctx.dispatchEvent(new CustomEvent(envelopeId + '.changed.data', {
                "detail": detail
            }));
        };
    };

    for (i = 0, j = patch.envelope.length; i < j; i += 1) {
        envelopeView[i] = new SustainEnvelopeView(ctx, patch.envelope[i], 'envelope' + i);
        document.body.appendChild(envelopeView[i].controller);
        ctx.addEventListener('envelope' + i + '.attack.change.data', getEnvelopeEventListener(patch.envelope[i].attack.steps, 'envelope' + i + '.attack'));
        ctx.addEventListener('envelope' + i + '.release.change.data', getEnvelopeEventListener(patch.envelope[i].release.steps, 'envelope' + i + '.release'));

    }
    ctx.addEventListener('oscillator.env0.change.data', getEnvelopeEventListener(patch.oscillator.pdEnvelope0, 'oscillator.env0'));
    ctx.addEventListener('oscillator.env1.change.data', getEnvelopeEventListener(patch.oscillator.pdEnvelope1, 'oscillator.env1'));


    ctx.addEventListener('oscillator.change.waveform', voiceParameterHandler('oscillator', 'waveform'));
    ctx.addEventListener('oscillator.change.wrapper', voiceParameterHandler('oscillator', 'wrapper'));
    ctx.addEventListener('oscillator.resonance.toggle', voiceParameterHandler('oscillator', 'resonanceActive'));
    ctx.addEventListener('oscillator.change.resonance', voiceParameterHandler('oscillator', 'resonance'));
    ctx.addEventListener('oscillator.change.mix', voiceParameterHandler('oscillator', 'mix'));

    var startTone = function (key, freq) {
        var i, j, frequency;
        if (typeof key === 'number') {
            frequency = tuning[key];
        } else {
            frequency = freq;
        }

        var voice = new Voice(ctx, patch, frequency);
        voice.connect(mainMix);

        lfo[0].outputs.oscillatorDetune.connect(voice.oscillator.detune);
        lfo[1].outputs.pdMix.connect(voice.oscillator.mix);
        lfo[2].outputs.resonance.connect(voice.oscillator.resonance);
        //        lfo[2].outputs.oscillatorDetune.connect(voice.oscillator.detune);
        voice.start(ctx.currentTime);
        reg.voices[key] = voice;

        ctx.dispatchEvent(new CustomEvent('voice.started', {
            'detail': {
                'keyNumber': key
            }
        }));
    };

    var deleteVoice = function (voice) {
        lfo[0].outputs.oscillatorDetune.disconnect(voice.detune);
        lfo[1].outputs.pdMix.disconnect(voice.mix);
    };
    var stopTone = function (key) {
        var voice = reg.voices[key];
        if (voice) {
            voice.stop(ctx.currentTime, deleteVoice);
            ctx.dispatchEvent(new CustomEvent('voice.ended', {
                'detail': {
                    'keyNumber': key
                }
            }));
        }
    };
    var appKeyDownHandler = function appKeyDownHandler(event) {
        startTone(event.detail.keyNumber);
    };
    var appKeyUpHandler = function appKeyUpHandler(event) {
        stopTone(event.detail.keyNumber);
    };
    ctx.addEventListener('keyboard.keydown', appKeyDownHandler);
    ctx.addEventListener('keyboard.keyup', appKeyUpHandler);

}
