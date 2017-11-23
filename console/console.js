'use strict';

function createCandidateList(candidates, type) {
    const margin = document.createTextNode(" ");
    if (type === 0) {
        return candidates.reduce((fragment, data) => {
            const li = document.createElement("li");
            const span = document.createElement("span");
            span.textContent = data;
            li.appendChild(margin.cloneNode(true));
            li.appendChild(span);
            fragment.appendChild(li);
            return fragment;
        }, document.createDocumentFragment());
    }
    else {
        const sep = document.createElement("span");
        sep.textContent = ":";
        const dataNode = document.createElement("span");
        dataNode.className = (type === 1 ? "ex_string_data" : "ex_number_data");
        const infoNode = document.createElement("span");
        infoNode.className = (type === 1 ? "ex_string_info" : "ex_number_info");
        return candidates.reduce((fragment, [data, info]) => {
            const li = document.createElement("li");
            const span1 = dataNode.cloneNode(false);
            span1.textContent = data;
            const span2 = infoNode.cloneNode(false);
            span2.textContent = info;
            li.appendChild(margin.cloneNode(true));
            li.appendChild(span1);
            li.appendChild(sep.cloneNode(true));
            li.appendChild(span2);
            fragment.appendChild(li);
            return fragment;
        }, document.createDocumentFragment());
    }
}
class Completer {
    constructor(container) {
        this.container = container;
        this.candidates = [];
        this.selectIndex = undefined;
        this.candidateInfo = undefined;
    }
    setMaxHeight(maxHeight) {
        this.container.style.maxHeight = maxHeight + "px";
    }
    reset() {
        this.candidates = [];
        this.selectIndex = undefined;
        this.candidateInfo = undefined;
        this.container.innerHTML = "";
    }
    hasCandidates() {
        return this.candidates.length !== 0;
    }
    setCandidates(candidateInfo) {
        this.candidates = [];
        let [orgValue, candidateStart, type, candidates] = candidateInfo;
        this.candidateInfo = candidateInfo;
        this.update(orgValue, false);
    }
    update(value, needFilter) {
        if (!this.candidateInfo) {
            return;
        }
        if (this.candidates.length !== 0 && this.candidates[0] === value) {
            return;
        }
        if (this.candidates[this.selectIndex] === value) {
            return;
        }
        let [orgValue, candidateStart, type, candidates] = this.candidateInfo;
        this.container.innerHTML = "";
        if (value.startsWith(orgValue)) {
            const keywords = value.substr(candidateStart).split(/\s+/);
            const filter = (type === 0 ?
                (c) => keywords.every((k) => c.includes(k)) :
                ([d, i]) => keywords.every((k) =>
                    d.toString().includes(k) || i.includes(k)));
            const matchCandidates =
                (needFilter ? candidates.filter(filter) : candidates);
            this.container.appendChild(
                createCandidateList(matchCandidates, type));
            const prefix = orgValue.substr(0, candidateStart);
            this.candidates =
                [ value ].concat(matchCandidates.map((c) => {
                    return type === 0 ? prefix + c : prefix + c[0];
                }));
            this.selectIndex = 0;
        }
        else {
            this.candidates = [];
            this.selectIndex = undefined;
            this.candidateInfo = undefined;
        }
    }
    selectNext(input) {
        this._selectCandidate(input, 1);
    }
    selectPrevious(input) {
        this._selectCandidate(input, -1);
    }
    _selectCandidate(input, diff) {
        if (!this.candidateInfo) {
            return;
        }
        let [orgValue, candidateStart, type, candidates] = this.candidateInfo;

        const SELECT_CLASS = "ex_select_candidate";
        if (this.selectIndex !== 0) {
            this.container.children[this.selectIndex - 1].classList.remove(
                SELECT_CLASS);
        }
        const length = this.candidates.length;
        this.selectIndex = (this.selectIndex + diff + length) % length;
        const selectItem = this.candidates[this.selectIndex];
        const data = (Array.isArray(selectItem) ? selectItem[0] : selectItem);

        const start = input.selectionStart;
        if (input.selectionEnd !== start) {
            input.selectionEnd = start;
        }
        input.setRangeText(data, 0, start, "end");
        if (this.selectIndex !== 0) {
            const li = this.container.children[this.selectIndex - 1];
            li.classList.add(SELECT_CLASS);
            Completer._scrollIntoView(li, this.container, diff);
        }
    }
    static _scrollIntoView(item, container, diff) {
        const itemRect = item.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (itemRect.top < containerRect.top) {
            container.scrollBy(0, itemRect.top - containerRect.top);
        }
        if (itemRect.bottom > containerRect.bottom) {
            container.scrollBy(0, itemRect.bottom - containerRect.bottom);
        }
    }
}

class History {
    constructor(key) {
        this.key = key;
        this.history = undefined;
        this.index = 0;
        this.candidateHistory = undefined;
        History.load(key).then((result) => {
            this.history = result[key];
        });
    }
    reset(value) {
        if (this.candidateHistory === undefined) {
            return;
        }
        if (value === this.candidateHistory[this.index]) {
            return;
        }
        this.candidateHistory = undefined;
        this.index = 0;
    }
    remove(value) {
        this.history = this.history.filter((item) => item !== value);
        browser.storage.local.set({ [this.key]: this.history });
        this.index = 0;
        this.candidateHistory = undefined;
    }
    removeAll() {
        browser.storage.local.remove(this.key);
        this.history = [];
        this.index = 0;
        this.candidateHistory = undefined;
    }
    select(input, diff) {
        if (this.candidateHistory === undefined) {
            const value = input.value;
            this.candidateHistory = this.history.filter(
                (item) => item.startsWith(value));
            this.candidateHistory.unshift(value);
        }
        const index = this.index + diff;
        if (!(0 <= index && index < this.candidateHistory.length)) {
            return;
        }
        input.value = this.candidateHistory[index];
        input.selectionStart = input.selectionEnd = input.value.length;
        this.index = index;
    }
    setNext(input) {
        this.select(input, -1);
    }
    setPrevious(input) {
        this.select(input, 1);
    }
    static load(key) {
        const param = { [key]: [] };
        return browser.storage.local.get(param);
    }
    static save(key, cmd) {
        History.load(key).then((result) => {
            const history = result[key];
            if (history.length > 0 && history[0] === cmd) {
                // Not save the same command as previous.
                return;
            }
            history.length = Math.min(history.length + 1, 100);
            history.copyWithin(1, 0, history.length);
            history[0] = cmd;
            browser.storage.local.set(result);
        }).catch ((error) => {
            console.error("failed to save history:", key, cmd);
        });
    }
};

function search(keyword, backward, mode) {
    return mode.sendMessage({
        command: "find", keyword: keyword, backward: backward
    }).then((result) => {
        if (result && !browser.extension.inIncognitoContext) {
            History.save("search_history", keyword);
        }
        if (result) {
            return [true, null];
        }
        else {
            return [false, "Pattern not found: " + keyword];
        }
    }).catch((error) => {
        return [false, error];
    });
}

class ConsoleCommand {
    static closeConsoleMode(mode) {
        mode.stopConsole(false);
    }
    static execute(mode) {
        mode.execute();
    }

    static selectNextHistory(mode) {
        const history = mode.history;
        if (history) {
            history.setNext(mode.getTarget());
        }
    }
    static selectPreviousHistory(mode) {
        const history = mode.history;
        if (history) {
            history.setPrevious(mode.getTarget());
        }
    }
    static removeFromHistory(mode) {
        const history = mode.history;
        if (history) {
            history.remove(mode.getTarget().value);
        }
    }
    static removeAllHistory(mode) {
        const history = mode.history;
        if (history) {
            history.removeAll();
        }
    }

    static getCandidate(mode) {
        const completer = mode.completer;
        if (completer) {
            const target = mode.getTarget();
            mode.sendMessage({
                command: "getCandidate",
                value: target.value.substring(0, target.selectionStart)
            }).then((result) => {
                if (!result) {
                    return;
                }
                completer.setCandidates(result);
                completer.selectNext(target);
            });
        }
    }
    static selectNextHistoryOrCandidate(mode) {
        const completer = mode.completer;
        if (completer && completer.hasCandidates()) {
            completer.selectNext(mode.getTarget());
        }
        else {
            ConsoleCommand.selectNextHistory(mode);
        }
    }
    static selectPreviousHistoryOrCandidate(mode) {
        const completer = mode.completer;
        if (completer && completer.hasCandidates()) {
            completer.selectPrevious(mode.getTarget());
        }
        else {
            ConsoleCommand.selectPreviousHistory(mode);
        }
    }

    static deleteCharBackward(mode) {
        if (!DomUtils.deleteCharBackward(mode.getTarget())) {
            mode.stopConsole(false);
        }
    }
    static deleteWordBackward(mode) {
        DomUtils.deleteWordBackward(mode.getTarget());
    }
    static deleteToBeggingOfLine(mode) {
        DomUtils.deleteToBeggingOfLine(mode.getTarget());
    }
    static deleteToEndOfLine(mode) {
        DomUtils.deleteToEndOfLine(mode.getTarget());
    }
}

const CONSOLE_CMD_MAP = Utils.toPreparedCmdMap({
    "<Enter>": "execute",
    "<C-M>": "execute",
    "<C-H>": "deleteCharBackward",
    "<C-W>": "deleteWordBackward",
    "<C-U>": "deleteToBeggingOfLine",
    "<C-K>": "deleteToEndOfLine",
    "<C-I>": "getCandidate",
    "<Tab>": "getCandidate",
    "<C-N>": "selectNextHistoryOrCandidate",
    "<C-P>": "selectPreviousHistoryOrCandidate",
    "<C-X><C-D>": "removeAllHistory",
    "<C-X><C-R>": "removeFromHistory",
    "<C-C>": "closeConsoleMode",
    "<Esc>": "closeConsoleMode",
    "<C-[>": "closeConsoleMode",
});
class ConsoleMode {
    constructor(options, port, input, container) {
        this._isOpened = false;
        this._inExec = false;
        this._port = port;
        this._input = input;
        this._input.parentNode.setAttribute("mode", options.mode);
        this._input.value = options.defaultCommand;
        this._mapper = Utils.makeCommandMapper(CONSOLE_CMD_MAP);

        this.onInit(container, options);
    }
    startConsole(options) {
        this._isOpened = true;
        this.onStart();
        this._input.focus();
    }
    stopConsole(result, reason=null) {
        this._isOpened = false;
        this.onStop();
        this._input.value = "";
        this.sendMessage({ command: "hideConsole", result, reason });
    }
    execute() {
        this._inExec = true;
        this.onExec().then(([result, reason]) => {
            this._inExec = false;
            this.stopConsole(result, reason);
        });
    }
    sendMessage(msg) {
        return this._port.sendMessage(msg);
    }
    get isOpened() {
        return this._isOpened;
    }
    get inExec() {
        return this._inExec;
    }
    handleKeydown(key) {
        const [consumed, optCmd, cmd, dropKeyList] = this._mapper.get(key);
        return (cmd ? !ConsoleCommand[cmd](this) : consumed);
    }
    handleKeyup() {
        return this.onKeyup(this._input);
    }
    getTarget() {
        return this._input;
    }
    isBackward() {
        return this._input.parentNode.getAttribute("mode") === "backwardSearch";
    }
}
class ExMode extends ConsoleMode {
    onInit(container, options) {
        this._completer = new Completer(container);
        this._history = new History("command_history");
    }
    onStart() {
        this._completer.setMaxHeight(window.innerHeight - 100);
    }
    onStop() {
        this._completer.reset();
    }
    onKeyup(input) {
        this._history.reset(input.value);
        this._completer.update(input.value, true);
    }

    get history() {
        return this._history;
    }
    get completer() {
        return this._completer;
    }
    onExec() {
        const value = this.getTarget().value;
        if (value === "") {
            return Promise.resolve([false, null]);
        }
        const prefix = value.charAt(0);
        if (prefix === "/" || prefix === "?") {
            return search(value.substr(1), prefix === '?', this);
        }

        return this.sendMessage({ command: "execCommand", cmd: value })
            .then((result) => {
                if (result && !browser.extension.inIncognitoContext) { // TODO
                    History.save("command_history", value);
                }
                if (typeof(result) === "boolean") {
                    return [true, null];
                }
                return [
                    true,
                    (Array.isArray(result) ? result.join("\n") : result)
                ];
            })
            .catch((error) => {
                return [false, error];
            });
    }
}
class SearchMode extends ConsoleMode {
    onInit(container, options) {
        this._history = new History("search_history");
    }
    onStart() {
    }
    onStop() {
    }
    onKeyup(input) {
        this._history.reset(input.value);
    }
    get history() {
        return this._history;
    }
    onExec() {
        const value = this.getTarget().value;
        if (value === "") {
            return Promise.resolve([false, null]);
        }
        return search(value, this.isBackward(), this);
    }

}
class HintFilterMode extends ConsoleMode {
    onInit(container, options) {
        this._prevFilter = options.defaultCommand;
    }
    onStart() {
    }
    onStop() {
    }
    onKeyup(input) {
        const filter = input.value;
        if (filter !== this._prevFilter) {
            super.sendMessage({ command: 'applyFilter', filter });
            this._prevFilter = filter;
        }
    }
    onExec() {
        const filter = this.getTarget().value;
        return Promise.resolve([true, filter]);
    }
}

function createConsoleMode(options, port, input, container) {
    switch (options.mode) {
        case "exec":
            return new ExMode(options, port, input, container);
        case "forwardSearch":
        case "backwardSearch":
            return new SearchMode(options, port, input, container);
        case "hintFilter":
            return new HintFilterMode(options, port, input, container);
        default:
            throw new Error("Unknown mode: " + options.mode);
    }
}

window.addEventListener("DOMContentLoaded", (e) => {
    const port = new Port(browser.runtime.connect({ name: "console" }));
    const input = document.getElementById("ex_input");
    const output = document.getElementById("ex_message");
    const container = document.getElementById("ex_candidates");
    let mode = undefined;

    port.onRequest.addListener((msg) => {
        switch (msg.command) {
            case "setConsoleMode":
                mode = createConsoleMode(msg.options, port, input, container);
                return true;
            case "setMessage":
                output.innerText = msg.message;
                output.parentNode.setAttribute("mode", "showMessage");
                return true;
            default:
                console.warn("Unknown command: ", msg.command);
                return false;
        }
    });
    input.addEventListener("keydown", (e) => {
        const key = Utils.getRegulatedKey(e);
        if (!key) {
            return;
        }

        // console.debug(e.type, key, e.defaultPrevented);
        if (mode.handleKeydown(key)) {
            e.stopPropagation();
            e.preventDefault();
        }
    });
    input.addEventListener("keyup", (e) => {
        mode.handleKeyup();
    }, true);

    window.addEventListener("focus", (e) => {
        if (mode.isOpened) {
            return;
        }
        mode.startConsole();
    });
    input.addEventListener("blur", (e) => {
        // If inExec, stopConsole is called by ConsoleMode.execute
        if (mode.isOpened && !mode.inExec) {
            mode.stopConsole()
        }
    });
}, { capture: true, once: true });
