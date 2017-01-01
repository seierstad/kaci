/* globals require, module */
"use strict";
import {BUFFER_LENGTH} from "./constants";

const NoiseGenerator = function (context, patch) {
    this.noiseColor = (patch && patch.color && this.noiseFunctions[patch.color]) ? patch.color : "white";
    this.generatorFunction = this.noiseFunctions[this.noiseColor];
    this.generator = context.createScriptProcessor(BUFFER_LENGTH, 0, 1);
    this.gainNode = context.createGain();
    this.gain = this.gainNode.gain;
    this.gain.value = 0;
    this.generator.connect(this.gainNode);
};
NoiseGenerator.prototype.start = function () {
    this.boundAudioProcessHandler = this.audioProcessHandler.bind(this);
    this.generator.addEventListener("audioprocess", this.boundAudioProcessHandler);
};
NoiseGenerator.prototype.stop = function () {
    this.generator.removeEventListener("audioprocess", this.boundAudioProcessHandler);
};
NoiseGenerator.prototype.audioProcessHandler = function (event) {
    const output = event.outputBuffer.getChannelData(0);
    this.generatorFunction(output);
};
NoiseGenerator.prototype.noiseFunctions = {
    "white": function whiteNoise (buffer) {
        for (let i = 0, j = buffer.length; i < j; i += 1) {
            buffer[i] = Math.random() * 2 - 1;
        }
    }
};
NoiseGenerator.prototype.setNoiseColor = function (color) {
    if (color && this.noiseFunctions[color] && color !== this.noiseColor) {
        this.noiseColor = color;
        this.generatorFunction = this.noiseFunctions[color];
    }
};
NoiseGenerator.prototype.connect = function (node) {
    if (node.hasOwnProperty("input")) {
        this.gainNode.connect(node.input);
    } else {
        this.gainNode.connect(node);
    }
};
NoiseGenerator.prototype.disconnect = function () {
    this.gainNode.disconnect();
};
NoiseGenerator.prototype.destroy = function () {
    this.noiseColor = null;
    this.generatorFunction = null;
    this.generator = null;
    this.gainNode = null;
};

export default NoiseGenerator;
