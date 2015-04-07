/*global require, module, document */
"use strict";
var DCGenerator = require('./DCGenerator'),
    IdealOscillator = require('./IdealOscillator');

var LFO = function (context, patch, id, options) {
    var syncMaster = (options && options.syncMaster);
    this.id = id || 'lfo';
    this.context = context;
    this.dc = new DCGenerator(context);
    this.inverter = context.createGain();
    this.offset = context.createGain();
    this.amount = context.createGain();
    this.sum = context.createChannelMerger();
    this.postGain = context.createGain(); // set gain.value to 0 to mute the lfo output
    this.outputs = {};

    this.dc.connect(this.offset);
    this.inverter.connect(this.amount);
    this.offset.connect(this.sum);
    this.amount.connect(this.sum);
    this.sum.connect(this.postGain);

    this.oscillator = new IdealOscillator(context);
    this.frequency = this.oscillator.frequency;
    this.detune = this.oscillator.detune;
    this.oscillator.connect(this.inverter);

    this.sync = {
        enabled: (patch.syncEnabled),
        ratio: {
            numerator: patch.syncRatioNumerator,
            denominator: patch.syncRatioDenominator
        }
    };
    this.values = {
        frequency: patch.frequency,
        currentFrequency: 0,
        amount: patch.amount
    };
    if (patch) {
        if (typeof patch.amount === 'number') {
            this.setValueAtTime(patch.amount, context.currentTime);
        }
        if (patch.syncEnabled && patch.syncRatioNumerator && patch.syncRatioDenominator) {
            this.syncToMaster();
        } else {
            if (typeof patch.frequency === 'number') {
                this.setFrequency(patch.frequency);
            }
        }
        if (patch.waveform) {
            this.setWaveform(patch.waveform);
        }
    }

    var that = this;
    this.context.addEventListener(this.id + '.change.waveform', function (event) {
        that.setWaveform(event.detail);
    });
    this.context.addEventListener(this.id + '.change.frequency', function (event) {
        that.values.frequency = event.detail;
        that.setFrequency(event.detail);

    });
    this.context.addEventListener(this.id + '.change.amount', function (event) {
        that.setValueAtTime(event.detail, context.currentTime);
    });
    this.context.addEventListener(this.id + '.change.sync.ratio', function (event) {
        that.sync.ratio.numerator = event.detail.numerator;
        that.sync.ratio.denominator = event.detail.denominator;
        that.syncToMaster();
    });
    this.context.addEventListener(this.id + '.change.sync.enable', function (event) {
        that.sync.enabled = true;
        that.syncToMaster();
    });
    this.context.addEventListener(this.id + '.change.sync.disable', function (event) {
        that.sync.enabled = false;
        that.setFrequency(that.values.frequency);
    });
    this.context.addEventListener(this.id + '.reset', function (event) {
        if (syncMaster) {
            that.context.dispatchEvent(new CustomEvent('lfo.master.reset', {}));
        }
        that.oscillator.resetPhase();
    });
    if (syncMaster) {
        this.isSyncMaster = true;
        this.context.addEventListener('lfo.master.requestZeroPhase', function (event) {
            that.oscillator.requestZeroPhaseEvent('lfo.master.zeroPhase');
        });
        this.context.addEventListener('lfo.master.requestFrequency', function (event) {
            that.context.dispatchEvent(new CustomEvent('lfo.master.frequency', {
                detail: that.values.currentFrequency
            }));
        });
    } else {
        this.context.addEventListener('lfo.master.changed.frequency', function (event) {
            if (that.sync.enabled) {
                var syncedFrequency = event.detail * that.sync.ratio.denominator / that.sync.ratio.numerator;
                that.setFrequency(syncedFrequency);
                that.syncToMaster();
            }
        });
        this.context.addEventListener('lfo.master.reset', function () {
            that.oscillator.resetPhase();
        });
    }

};
LFO.prototype.setFrequency = function (frequency) {
    this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    if (frequency !== this.values.currentFrequency) {
        this.values.currentFrequency = frequency;
        this.context.dispatchEvent(new CustomEvent(this.id + '.changed.frequency', {
            detail: this.values.currentFrequency
        }));

        if (this.isSyncMaster) {
            this.context.dispatchEvent(new CustomEvent('lfo.master.changed.frequency', {
                detail: this.values.currentFrequency
            }));
        }
    }
};
LFO.prototype.syncToMaster = function () {
    var that = this,
        masterZeroPhaseHandler,
        masterFrequencyHandler;

    masterZeroPhaseHandler = function (event) {
        masterFrequencyHandler(event);
        that.oscillator.resetPhase();
        that.context.removeEventListener('lfo.master.zeroPhase', masterZeroPhaseHandler);
    };
    masterFrequencyHandler = function (event) {
        var syncedFrequency;

        if (!isNaN(event.detail)) {
            if (that.sync.enabled) {
                syncedFrequency = event.detail * that.sync.ratio.denominator / that.sync.ratio.numerator;
                that.setFrequency(syncedFrequency);
            }
        }
        that.context.removeEventListener('lfo.master.frequency', masterFrequencyHandler);
    };

    this.context.addEventListener('lfo.master.zeroPhase', masterZeroPhaseHandler);
    this.context.dispatchEvent(new CustomEvent('lfo.master.requestZeroPhase', {}));
    this.context.addEventListener('lfo.master.frequency', masterFrequencyHandler);
    this.context.dispatchEvent(new CustomEvent('lfo.master.requestFrequency', {}));

};
LFO.prototype.setValueAtTime = function (value, time) {
    this.amount.gain.setValueAtTime(value / 2, time);
    this.offset.gain.setValueAtTime(value / 2, time);
};
LFO.prototype.setWaveform = function (waveformName) {
    this.oscillator.setWaveform(waveformName);
};
LFO.prototype.getWaveforms = function () {
    return this.oscillator.waveforms;
};
LFO.prototype.start = function (time) {
    this.oscillator.start(time);
};
LFO.prototype.stop = function (time) {
    var osc = this.context.createOscillator();
    osc.frequency.value = this.oscillator.frequency.value;
    osc.detune.value = this.oscillator.detune.value;
    osc.type = this.oscillator.type.value;
    osc.connect(this.inverter);

    this.oscillator.stop(time);
    this.oscillator.disconnect(this.inverter);

    this.oscillator = osc;

};
LFO.prototype.connect = function (node) {
    if (node.hasOwnProperty('input')) {
        this.postGain.connect(node.input);
    } else {
        this.postGain.connect(node);
    }
};
LFO.prototype.addOutput = function (name, range) {
    if (this.outputs[name]) {
        throw {
            "error": "An output named '" + name + "' already exists"
        };
    }

    var out = this.context.createGain();
    out.gain.value = range;
    this.postGain.connect(out);

    this.outputs[name] = out;
    return out;
};
module.exports = LFO;
