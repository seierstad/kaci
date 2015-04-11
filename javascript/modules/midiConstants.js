var midiConstants = {
    "MESSAGE_TYPE": {
        "NOTE_OFF": 0x80,
        "NOTE_ON": 0x90,
        "POLY_PRESSURE": 0xA0,
        "CONTROL_CHANGE": 0xB0,
        "PROGRAM_CHANGE": 0xC0,
        "CHANNEL_PRESSURE": 0xD0,
        "PITCH_BEND": 0xE0,
        "SYSTEM_EXCLUSIVE": 0xF0
    },
    "CONTROL": {
        "BANK_SELECT_MSB": 0x00,
        "BANK_SELECT_LSB": 0x20,

        "MODULATION_WHEEL_MSB": 0x01,
        "MODULATION_WHEEL_LSB": 0x21,

        "BREATH_CONTROLLER_MSB": 0x02,
        "BREATH_CONTROLLER_LSB": 0x22,

        "FOOT_PEDAL_MSB": 0x04,
        "FOOT_PEDAL_LSB": 0x24,

        "PORTAMENTO_TIME_MSB": 0x05,
        "PORTAMENTO_TIME_LSB": 0x25,

        "DATA_ENTRY_MSB": 0x06,
        "DATA_ENTRY_LSB": 0x26,

        "VOLUME_MSB": 0x07,
        "VOLUME_LSB": 0x27,

        "BALANCE_MSB": 0x08,
        "BALANCE_LSB": 0x28,

        "PAN_POSITION_MSB": 0x0A,
        "PAN_POSITION_LSB": 0x2A,

        "EXPRESSION_MSB": 0x0B,
        "EXPRESSION_LSB": 0x2B,

        "EFFECT_CONTROL_1_MSB": 0x0C,
        "EFFECT_CONTROL_1_LSB": 0x2C,

        "EFFECT_CONTROL_2_MSB": 0x0D,
        "EFFECT_CONTROL_2_LSB": 0x2D,

        "GENERAL_PURPOSE_SLIDER_1": 0x10,
        "GENERAL_PURPOSE_SLIDER_2": 0x11,
        "GENERAL_PURPOSE_SLIDER_3": 0x12,
        "GENERAL_PURPOSE_SLIDER_4": 0x13,

        "HOLD_PEDAL_SWITCH": 0x40,
        "PORTAMENTO_SWITCH": 0x41,
        "SUSTENUTO_PEDAL_SWITCH": 0x42,
        "SOFT_PEDAL_SWITCH": 0x43,
        "LEGATO_PEDAL_SWITCH": 0x44,
        "HOLD_2_PEDAL_SWITCH": 0x45,

        "SOUND_VARIATION": 0x46,
        "SOUND_TIMBRE": 0x47,
        "SOUND_RELEASE_TIME": 0x48,
        "SOUND_ATTACK_TIME": 0x49,
        "SOUND_BRIGHTNESS": 0x4A,

        "SOUND_CONTROL_6": 0x4B,
        "SOUND_CONTROL_7": 0x4C,
        "SOUND_CONTROL_8": 0x4D,
        "SOUND_CONTROL_9": 0x4E,
        "SOUND_CONTROL_10": 0x4F,

        "GENERAL_PURPOSE_BUTTON_1_SWITCH": 0x50,
        "GENERAL_PURPOSE_BUTTON_2_SWITCH": 0x51,
        "GENERAL_PURPOSE_BUTTON_3_SWITCH": 0x52,
        "GENERAL_PURPOSE_BUTTON_4_SWITCH": 0x53,

        "EFFECTS_LEVEL": 0x5B,
        "TREMULO_LEVEL": 0x5C,
        "CHORUS_LEVEL": 0x5D,
        "CELESTE_LEVEL": 0x5E,
        "PHASER_LEVEL": 0x5F,

        "DATA_BUTTON_INCREMENT": 0x60,
        "DATA_BUTTON_DECREMENT": 0x61,

        "NON-REGISTERED_PARAMETER_LSB": 0x62,
        "NON-REGISTERED_PARAMETER_MSB": 0x63,

        "REGISTERED_PARAMETER_LSB": 0x64,
        "REGISTERED_PARAMETER_MSB": 0x65,

        "ALL_SOUND_OFF": 0x78,
        "ALL_CONTROLLERS_OFF": 0x79,
        "LOCAL_KEYBOARD_SWITCH": 0x7A,
        "ALL_NOTES_OFF": 0x7B,

        "OMNI_MODE_OFF": 0x7C,
        "OMNI_MODE_ON": 0x7D,

        "MONO_OPERATION": 0x7E,
        "POLY_OPERATION": 0x7F
    }
};
module.exports = midiConstants;