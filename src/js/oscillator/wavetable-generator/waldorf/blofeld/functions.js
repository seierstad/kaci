"use strict";

import { floatToPCM } from "wav-recorder-node";
import { MANUFACTURER_ID as WALDORF_ID } from "../defaults.js";
import { BLOFELD_ID, DEVICE_ID_BROADCAST } from "./defaults.js";


const SYSEX_START = 0xF0;
const WAVETABLE_DUMP = 0x12;
const FORMAT = 0x00;
const RESERVED = 0x00;
const SYSEX_END = 0xF7;

const mask7bits = 0x7F;


// check length and legal characters
const isValidName = (name) => name.length <= 14 && !Array.from(name).some(l => l.charCodeAt() < 0x20 || l.charCodeAt() > 0x7F);


const waldorfBlofeldWave = (output, input, name, slot = 80, waveNumber = 0, deviceId = DEVICE_ID_BROADCAST) => {

    /*
        parameters:
        -----------

        output: Uint8Array, length 410
        input: Float32Array, length >= 128
        name: String, length <= 14
        slot: integer, 80...118
    */


    let result;
    let buffer;

    if (!isValidName(name)) {
        throw new Error("'" + name + "' is not a valid wavetable name");
    }

    if (output === null) {
        buffer = new ArrayBuffer(410);
        result = new Uint8Array(buffer);
    } else {
        result = output;
    }


    let index = 0;


    result[index] = SYSEX_START;
    index += 1;
    result[index] = WALDORF_ID;
    index += 1;
    result[index] = BLOFELD_ID;
    index += 1;
    result[index] = deviceId; // device number, 0x7F = broadcast
    index += 1;
    result[index] = WAVETABLE_DUMP; // message id
    index += 1;
    result[index] = slot & mask7bits; // location high byte
    index += 1;
    result[index] = waveNumber & mask7bits; // location low byte
    index += 1;

    const checkStart = index;

    // Data part of sysex message
    result[index] = FORMAT;
    index += 1;

    // wave data

    const dv = new DataView(result.buffer, result.byteOffset + index, 128 * 3);

    floatToPCM(dv, 0, input, 21, false, 7);
    index += (128 * 3);

    // name
    Array.from(name.padEnd(14)).forEach(letter => {
        result[index] = letter.charCodeAt() & mask7bits;
        index += 1;
    });

    // reserved bytes
    result[index] = RESERVED;
    index += 1;
    result[index] = RESERVED;
    index += 1;

    const checkEnd = index;

    // checksum
    result[index] = result.subarray(checkStart, checkEnd).reduce((acc, value) => acc + value) & mask7bits;
    index += 1;
    result[index] = SYSEX_END;

    return result;
};


const waldorfBlofeldWavetable = (output, input, name, slot, deviceId = DEVICE_ID_BROADCAST) => {
    /*
        parameters:
        -----------

        output: Uint8Array, length 410 * 64 or null
        input: Float32Array, length >= 128 * 64
        name: String, length <= 14
        slot: integer, 80...118
    */

    let result;
    let buffer;

    if (!isValidName(name)) {
        throw new Error("'" + name + "' is not a valid wavetable name");
    }

    if (output === null) {
        buffer = new ArrayBuffer(410 * 64);
        result = new Uint8Array(buffer);
    } else {
        result = output;
    }

    for (let i = 0; i < 64; i += 1) {
        waldorfBlofeldWave(result.subarray(i * 410, (i + 1) * 410), input.subarray(i * 128, (i + 1) * 128), name, slot, i, deviceId);
    }
    return result;
};


export {
    waldorfBlofeldWave,
    waldorfBlofeldWavetable,
    DEVICE_ID_BROADCAST
};
