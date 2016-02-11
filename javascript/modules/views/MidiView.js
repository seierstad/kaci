var MidiView = function (context) {
    "use strict";
    this.view = document.createElement('fieldset');
    this.view.classList.add('midi-view');
    var heading = document.createElement('legend');
    heading.innerHTML = 'midi';
    this.view.appendChild(heading);
    this.ports = {};
    var that = this;

    var changePortHandler = function (event) {
        context.dispatchEvent(new CustomEvent('midi.select.input.port', {
            'detail': event.target.value
        }));
    };

    var noMidiMessage = function noMidiMessage(event) {
        var message = document.createElement('span');
        message.innerHTML = 'midi is not supported in this browser/device';
        that.view.appendChild(message);
        that.view.classList.add('unsupported');
    };
    var addPortSelector = function (event) {
        var i, j, port, option;
        var selectElement = document.createElement('select');
        option = document.createElement('option');
        option.innerHTML = 'velg port';
        selectElement.appendChild(option);
        var portIds = Object.keys(event.detail.ports);
        for (i = 0, j = portIds.length; i < j; i += 1) {
            port = event.detail.ports[portIds[i]];
            option = document.createElement('option');
            option.value = port.id;
            option.innerHTML = port.name + ((port.manufacturer) ? ' (' + port.manufacturer + ')' : '');
            that.ports[port.id] = option;
            selectElement.appendChild(option);
        }
        selectElement.addEventListener('input', changePortHandler);
        that.view.appendChild(selectElement);
    };
    var portSelectedHandler = function (event) {
        var portId = event.detail;
        if (this.ports[portId]) {
            this.ports[portId].selected = true;
        }
    };


    context.addEventListener('midi.ports.added', addPortSelector);
    context.addEventListener('system.feature.missing.midi', noMidiMessage);
    context.addEventListener('system.midi.port.selected', portSelectedHandler.bind(this));
    return this.view;
};
module.exports = MidiView;