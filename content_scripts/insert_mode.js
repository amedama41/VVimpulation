class InsertMode {
    constructor(frameInfo, keyMap, data) {
        this.mapper = Utils.makeCommandMapper(keyMap);
        this.lastFocusedElem = data.lastFocusedElem;
        this.target = data.editableElement;
        this.target.undoStack = [];
        this.target.focus();
        if (document.activeElement !== this.target) {
            throw new Error(`Target element is not focusable (${this.target})`);
        }
        this.target.classList.add("wimpulation-input");
        this.inInvoking = false;
        frameInfo.setEventListener(this.target, "blur", (e, frameInfo) => {
            if (this.inInvoking) {
                return;
            }
            FrontendCommand.toNormalMode(0, frameInfo);
        }, true);
    }
    getTarget() {
        return this.target;
    }
    onReset() {
        try {
            this.target.classList.remove("wimpulation-input");
            if (document.activeElement === this.target) {
                if (document.hasFocus && this.lastFocusedElem) {
                    this.lastFocusedElem.focus();
                }
            }
        }
        catch (e) {
            console.warn("Some error occured:", Utils.errorString(e));
        }
    }
    onKeyEvent(key, frameInfo) {
        const [consumed, optCmd, cmd] = this.mapper.get(key);
        if (optCmd) {
            this._invoke(optCmd, frameInfo);
        }
        if (cmd) {
            return this._invoke(cmd, frameInfo);
        }
        if (consumed) {
            return true;
        }
        if (key.length === 1
            || key === "<Space>" || key === "<S-Space>"
            || key === "<Backspace>" || key === "<Delete>"
            || key === "<Enter>") {
            this.target.undoStack.push(this.target.value);
            return false;
        }
        return true;
    }
    _invoke(cmd, frameInfo) {
        this.inInvoking = true;
        try {
            return !invokeCommand(cmd, 0, frameInfo);
        }
        finally {
            this.inInvoking = false;
        }
    }
}

