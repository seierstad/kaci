var KeyboardInputView = function (context) {
    "use strict";
    var initializeView, changeLayout, changeLayoutHandler;
    this.view = document.createElement('fieldset');
    this.view.classList.add('keyboard-input-view');

    changeLayoutHandler = function (event) {
        changeLayout(event.target.value);
    };
    changeLayout = function (layout) {
        context.dispatchEvent(new CustomEvent('system.keyboard.input.changeLayout', {
            "detail": layout
        }));
    };

    initializeView = function (event) {
        var i, j, option, select, list, active;
        list = event.detail.availableLayouts;
        active = event.detail.active;
        select = document.createElement('select');
        for (i = 0, j = list.length; i < j; i += 1) {
            option = document.createElement('option');
            option.innerHTML = list[i];
            if (list[i] === active) {
                option.selected = true;
            }
            select.appendChild(option);
        }
        this.view.appendChild(select);
        select.addEventListener('input', changeLayoutHandler);
    };

    context.addEventListener('system.keyboard.input.initialized', initializeView.bind(this));

    return this.view;
};
module.exports = KeyboardInputView;