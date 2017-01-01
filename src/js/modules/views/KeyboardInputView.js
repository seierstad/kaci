const KeyboardInputView = function (context) {
    this.view = document.createElement("fieldset");
    this.view.classList.add("keyboard-input-view");

    const changeLayout = function (layout) {
        context.dispatchEvent(new CustomEvent("system.keyboard.input.changeLayout", {
            "detail": layout
        }));
    };

    const changeLayoutHandler = function (event) {
        changeLayout(event.target.value);
    };

    const initializeView = function (event) {
        const list = event.detail.availableLayouts;
        const active = event.detail.active;
        const select = document.createElement("select");
        for (let i = 0, j = list.length; i < j; i += 1) {
            const option = document.createElement("option");
            option.innerHTML = list[i];
            if (list[i] === active) {
                option.selected = true;
            }
            select.appendChild(option);
        }
        this.view.appendChild(select);
        select.addEventListener("input", changeLayoutHandler);
    };

    context.addEventListener("system.keyboard.input.initialized", initializeView.bind(this));

    return this.view;
};


export default KeyboardInputView;
