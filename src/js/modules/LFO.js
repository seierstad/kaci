import IdealOscillator from "./IdealOscillator";

const LFO = function (context, patch, id, options) {
    const syncMaster = (options && options.syncMaster);

    this.id = id || "lfo";
    this.context = context;
    this.postGain = context.createGain(); // set gain.value to 0 to mute the lfo output
    this.oscillator = new IdealOscillator(context);
    this.outputs = {};

    this.oscillator.connect(this.postGain);


    this.frequency = this.oscillator.frequency;
    this.detune = this.oscillator.detune;

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
        if (typeof patch.amount === "number") {
            this.setValueAtTime(patch.amount, context.currentTime);
        }
        if (patch.syncEnabled && patch.syncRatioNumerator && patch.syncRatioDenominator) {
            this.syncToMaster();
        } else {
            if (typeof patch.frequency === "number") {
                this.setFrequency(patch.frequency);
            }
        }
        if (patch.waveform) {
            this.setWaveform(patch.waveform);
        }
    }
    if (syncMaster) {
        this.isSyncMaster = true;
    }
    this.addEventListeners();
    this.addOutput("positive", [ 0, 1]);
    this.addOutput("negative", [-1, 0]);
};
LFO.prototype.addEventListeners = function () {
    this.eventHandlers = [{
        "event": "lfo.change.waveform",
        "handler": function lfoWaveformChangeHandler (event) {
            if (event.detail.id === this.id) {
                this.setWaveform(event.detail.value);
            }
        }.bind(this)
    }, {
        "event": "lfo.change.frequency",
        "handler": function lfoFrequencyChangeHandler (event) {
            if (event.detail.id === this.id) {
                this.values.frequency = event.detail.value;
                this.setFrequency(event.detail.value);
            }
        }.bind(this)
    }, {
        "event": "lfo.change.amount",
        "handler": function lfoChangeAmountHandler (event) {
            if (event.detail.id === this.id) {
                this.setValueAtTime(event.detail.value, this.context.currentTime);
            }
        }.bind(this)
    }, {
        "event": "lfo.change.sync.ratio",
        "handler": function lfoChangeHandler (event) {
            if (event.detail.id === this.id) {
                this.sync.ratio.numerator = event.detail.numerator;
                this.sync.ratio.denominator = event.detail.denominator;
                this.syncToMaster();
            }
        }.bind(this)
    }, {
        "event": "lfo.change.sync.enable",
        "handler": function lfoSyncEnableHandler (event) {
            if (event.detail.id === this.id) {
                this.sync.enabled = true;
                this.syncToMaster();
            }
        }.bind(this)
    }, {
        "event": "lfo.change.sync.disable",
        "handler": function lfoSyncDisableHandler (event) {
            if (event.detail.id === this.id) {
                this.sync.enabled = false;
                this.setFrequency(this.values.frequency);
            }
        }.bind(this)
    }, {
        "event": "lfo.reset",
        "handler": function lfoChangeHandler (event) {
            if (event.detail.id === this.id) {
                if (this.isSyncMaster) {
                    this.context.dispatchEvent(new CustomEvent("lfo.master.reset", {}));
                }
                this.oscillator.resetPhase();
            }
        }.bind(this)
    }];


    if (this.isSyncMaster) {
        this.eventHandlers.push({
            "event": "lfo.master.requestZeroPhase",
            "handler": function lfoChangeHandler () {
                this.oscillator.requestZeroPhaseEvent("lfo.master.zeroPhase");
            }.bind(this)
        });
        this.eventHandlers.push({
            "event": "lfo.master.requestFrequency",
            "handler": function lfoChangeHandler () {
                this.context.dispatchEvent(new CustomEvent("lfo.master.frequency", {
                    detail: this.values.currentFrequency
                }));
            }.bind(this)
        });
    } else {
        this.eventHandlers.push({
            "event": "lfo.master.changed.frequency",
            "handler": function lfoChangeHandler (event) {
                if (this.sync.enabled) {
                    const syncedFrequency = event.detail * this.sync.ratio.denominator / this.sync.ratio.numerator;
                    this.setFrequency(syncedFrequency);
                    if (this.mode !== "voice") {
                        this.syncToMaster();
                    }
                }
            }.bind(this)
        });
        this.eventHandlers.push({
            "event": "lfo.master.reset",
            "handler": function lfoChangeHandler () {
                if (this.mode !== "voice") {
                    this.oscillator.resetPhase();
                }
            }.bind(this)
        });
    }
    for (let i = 0, j = this.eventHandlers.length; i < j; i += 1) {
        this.context.addEventListener(this.eventHandlers[i].event, this.eventHandlers[i].handler, false);
    }
};
LFO.prototype.removeEventListeners = function () {
    for (let i = 0, j = this.eventHandlers.length; i < j; i += 1) {
        this.context.removeEventListener(this.eventHandlers[i].event, this.eventHandlers[i].handler);
    }
};
LFO.prototype.setFrequency = function (frequency) {
    if (frequency !== this.values.currentFrequency) {
        this.values.currentFrequency = frequency;
        this.context.dispatchEvent(new CustomEvent(this.id + ".changed.frequency", {
            detail: this.values.currentFrequency
        }));

        if (this.isSyncMaster) {
            this.context.dispatchEvent(new CustomEvent("lfo.master.changed.frequency", {
                detail: this.values.currentFrequency
            }));
        }
        this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    }
};
LFO.prototype.syncToMaster = function () {
    const that = this;

    const masterFrequencyHandler = function (event) {
        if (!isNaN(event.detail)) {
            if (that.sync.enabled) {
                const syncedFrequency = event.detail * that.sync.ratio.denominator / that.sync.ratio.numerator;
                that.setFrequency(syncedFrequency);
            }
        }
        that.context.removeEventListener("lfo.master.frequency", masterFrequencyHandler);
    };

    const masterZeroPhaseHandler = function (event) {
        masterFrequencyHandler(event);
        that.oscillator.resetPhase();
        that.context.removeEventListener("lfo.master.zeroPhase", masterZeroPhaseHandler);
    };

    this.context.addEventListener("lfo.master.zeroPhase", masterZeroPhaseHandler);
    this.context.dispatchEvent(new CustomEvent("lfo.master.requestZeroPhase", {}));
    this.context.addEventListener("lfo.master.frequency", masterFrequencyHandler);
    this.context.dispatchEvent(new CustomEvent("lfo.master.requestFrequency", {}));

};
LFO.prototype.updateOutputRanges = function () {
    if (this.outputs.positive) {
        this.outputs.positive.curve = new Float32Array([0, this.values.amount]);
    }
    if (this.outputs.negative) {
        this.outputs.negative.curve = new Float32Array([-this.values.amount, 0]);
    }
};

LFO.prototype.setValueAtTime = function (value, time) {
    let delay = 0;

    this.postGain.gain.setValueAtTime(value, time);
    this.values.amount = value;

    if (time) {
        delay = Math.max(time - this.context.currentTime, 0);
    }
    setTimeout(this.updateOutputRanges.bind(this), delay);
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
LFO.prototype.stop = function () {
    this.oscillator.stop();
};
LFO.prototype.destroy = function () {
    this.removeEventListeners();
    this.postGain.disconnect();
    this.postGain = null;
    this.oscillator.destroy();
    this.oscillator = null;
};
LFO.prototype.disconnect = function () {
    this.postGain.disconnect();
};
LFO.prototype.connect = function (node) {
    if (node.hasOwnProperty("input")) {
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
    const shaper = this.context.createWaveShaper();

    if (range && range.length === 2) {
        shaper.curve = new Float32Array(range);
    }

    this.oscillator.connect(shaper);
    this.outputs[name] = shaper;
};


export default LFO;
