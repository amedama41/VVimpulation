'use strict';

const DEFAULT_OPTIONS = {
    "keyMapping": {
        "normal": {
            ".": "repeatLastCommand",
            "<C-Z>": "toSuspendMode",
            "<Esc>": "toNormalMode",
            "<C-[>": "toNormalMode",
            "f": "toHintMode",
            "F": "toHintFocusMode",
            "gF": "toHintMediaMode",
            "I": "toInsertModeOnFirstElement",
            "i": "toInsertMode",
            "A": "toInsertModeOnLastElement",
            "v": "toVisualMode",
            "gv": "toVisualModeWithCurrentSelection",
            ":": "toConsoleMode",
            "g<": "showLastMessage",
            "o": "smartOpen",
            "O": "smartOpenInTab",
            "gf": "openSource",
            "<C-W>gf": "openSourceInTab",
            "<C-G>": "toConsoleModeWithURL.open",
            "t": "toConsoleMode.tabopen",
            "T": "toConsoleModeWithURL.tabopen",
            "/": "toSearchMode",
            "?": "toBackwardSearchMode",
            "e": "pressEnter",
            "gg": "scrollTop",
            "M": "scrollMiddle",
            "G": "scrollBottom",
            "^": "scrollHome",
            "$": "scrollEnd",
            "j": "scrollDown",
            "k": "scrollUp",
            "h": "scrollLeft",
            "l": "scrollRight",
            "<C-E>": "scrollLineDown",
            "<C-Y>": "scrollLineUp",
            "<C-D>": "moveHalfPageDown",
            "<C-U>": "moveHalfPageUp",
            "<C-F>": "movePageDown",
            "<C-B>": "movePageUp",
            "%": "scrollPercent",
            "zt": "moveTargetAtTop",
            "zz": "moveTargetAtCenter",
            "zb": "moveTargetAtBottom",
            "gj": "selectNextOption",
            "gk": "selectPreviousOption",
            "g~": "toggleSelectOption",
            "n": "findNext",
            "N": "findPrevious",
            "}": "findNextPage",
            "{": "findPreviousPage",
            "gt": "nextTab",
            "gT": "previousTab",
            "<C-N>": "nextTab",
            "<C-P>": "previousTab",
            "g0": "firstTab",
            "g$": "lastTab",
            "<C-^>": "lastActivatedTab",
            "<": "moveTabToLeft",
            ">": "moveTabToRight",
            "dd": "removeCurrentTab",
            "dw": "removeCurrentWindow",
            "u": "undoCloseTab",
            "<C-C>": "stopLoad",
            "<C-L>": "reload",
            "g<C-L>": "reloadSkipCache",
            "<C-O>": "back",
            "<C-I>": "forward",
            "<C-A>": "incrementURL",
            "<C-X>": "decrementURL",
            "gu": "goToParent",
            "gU": "goToRoot",
            "]]": "focusNext",
            "[[": "focusPrevious",
            "_": "resetFocus",
            "zi": "zoomIn",
            "zo": "zoomOut",
            "zr": "zoomReset",
            "z=": "killHover",
            "yy": "yankCurrentURL",
            "yh": "yankPageHost",
            "yt": "yankPageTitle",
            "yit": "yankInnerHTML",
            "yat": "yankOuterHTML",
            "ye": "yankInnerText",
            "yv": "yankSelection",
            "<Space><Space>": "playOrPause",
            "<Space>j": "volumeDown",
            "<Space>k": "volumeUp",
            "<Space>h": "seekBack",
            "<Space>l": "seekForward",
            "<Space>r": "switchLoop",
            "<Space><C-L>": "reloadVideo",
            "<Space><C-G>": "showVideInfo",
            "<C-W><C-W>": "focusNextFrame",
            "<C-W>w": "focusNextFrame",
            "<C-W><C-T>": "focusTopFrame",
            "<C-W>t": "focusTopFrame",
            "<C-W>o": "openLinkInFrame",
            "<C-W>f": "openSourceInFrame",
            "<C-W><C-I>": "forwardFrame",
            "<C-W><C-O>": "backFrame",
            "<C-W><C-C>": "stopLoadFrame",
            "<C-W>c": "stopLoadFrame",
            "<C-W><C-L>": "reloadFrame",
            "<C-W>l": "reloadFrame",
            "<C-W><C-A>": "incrementFrameURL",
            "<C-W>a": "incrementFrameURL",
            "<C-W><C-X>": "decrementFrameURL",
            "<C-W>x": "decrementFrameURL",
            "<C-W>yy": "yankFrameURL",
            "<C-W>yh": "yankFrameHost",
            "<C-W>yt": "yankFrameTitle",
            "<C-W><C-G>": "showFrameURL",
            "<Tab>": "ignore",
            "<S-Tab>": "ignore",
            "<Enter>": "ignore",
            "<C-Enter>": "ignore",
            "<S-Enter>": "ignore",
            "<A-Enter>": "ignore",
            "<M-Enter>": "ignore",
        },
        "insert": {
            "<C-Z>": "toSuspendMode",
            "<C-H>": "deleteCharBackward",
            "<C-W>": "deleteWordBackward",
            "<C-K>": "deleteToEndOfLine",
            "<C-U>": "deleteToBeginningOfLine",
            "<C-F>": "charNext",
            "<C-B>": "charPrevious",
            "<C-A>": "beginLine",
            "<C-E>": "endLine",
            "<C-N>": "nextLine",
            "<C-P>": "previousLine",
            "<C-O>u": "undo",
            "<C-O><C-U>": "undo",
            "<C-O>y": "yankValue",
            "<C-O><C-Y>": "yankValue",
            "<C-O>p": "pasteValue",
            "<C-O><C-P>": "pasteValue",
            "<C-M>": "pressEnter",
            "<C-C>": "toNormalMode",
            "<C-[>": "toNormalMode",
            "<Esc>": "toNormalMode",
            "<Tab>": "toInsertModeOnNextInput",
            "<S-Tab>": "toInsertModeOnPreviousInput",
        },
        "visual": {
            "h": "move backward character",
            "l": "move forward character",
            "b": "move backward word",
            "w": "move forward word",
            "j": "move forward line",
            "k": "move backward line",
            ")": "move forward sentence",
            "(": "move backward sentence",
            "}": "move forward paragraph",
            "{": "move backward paragraph",
            "0": "move backward lineboundary",
            "$": "move forward lineboundary",
            "G": "move forward documentboundary",
            "gg": "move backward documentboundary",
            "y": "yankSelection",
            "d": "deleteSelection",
            "o": "reverseSelectionEndpoints",
            "c": "toCaretMode",
            "v": "toVisualMode",
            "<C-[>": "toNormalMode",
            "<C-C>": "toNormalMode",
            "<Esc>": "toNormalMode",
        },
        "hint": {
            "<C-L>": { command: "hint.reconstruct" },
            "<Tab>": { command: "hint.nextHint" },
            "<S-Tab>": { command: "hint.previousHint" },
            ";": { command: "hint.nextHint" },
            ",": { command: "hint.previousHint" },
            "/": { command: "hint.startFilter" },
            "ff": { command: "hint.toggleAutoFocus" },
            "fi": { command: "focusin", count: 0 },
            "fo": { command: "focusout", count: 0 },
            "c": { command: "mouseclick", count: 0 },
            "mc": { command: "mouseclick", count: 0 },
            "mC": { command: "mouseclick", count: 2 },
            "m<C-C>": { command: "mouseclick", count: 1 },
            "m<M-C>": { command: "mouseclick", count: 8 },
            "md": { command: "mousedown", count: 0 },
            "mD": { command: "mousedown", count: 2 },
            "m<C-D>": { command: "mousedown", count: 1 },
            "mu": { command: "mouseup", count: 0 },
            "mU": { command: "mouseup", count: 2 },
            "m<C-U>": { command: "mouseup", count: 1 },
            "mi": { command: "mouseinTo", count: 0 },
            "mI": { command: "mouseinFrom", count: 0 },
            "mo": { command: "mouseoutFrom", count: 0 },
            "mO": { command: "mouseoutTo", count: 0 },
            "mm": { command: "mousemove", count: 5 },
            "e": { command: "pressEnter", count: 0 },
            "E": { command: "pressEnter", count: 2 },
            "<C-E>": { command: "pressEnter", count: 1 },
            "<M-E>": { command: "pressEnter", count: 8 },
            "o": { command: "smartOpen", count: 0 },
            "O": { command: "smartOpenInTab", count: 0 },
            "gf": { command: "openSource", count: 0 },
            "<C-W>gf": { command: "openSourceInTab", count: 0 },
            "y": { command: "yankLink", count: 0 },
            "s": { command: "downloadLink", count: 0 },
            "v": { command: "selectElement", count: 0 },
            "de": { command: "deleteElement", count: 0 },
            "<C-C>": { command: "toNormalMode", count: 0 },
            "<C-[>": { command: "toNormalMode", count: 0 },
            "<Esc>": { command: "toNormalMode", count: 0 },
        },
        "console": {
            "<Enter>": "console.execute",
            "<C-M>": "console.execute",
            "<C-H>": "console.deleteCharBackward",
            "<C-W>": "console.deleteWordBackward",
            "<C-U>": "console.deleteToBeginningOfLine",
            "<C-K>": "console.deleteToEndOfLine",
            "<C-A>": "console.beginLine",
            "<C-E>": "console.endLine",
            "<C-F>": "console.charNext",
            "<C-B>": "console.charPrevious",
            "<C-I>": "console.getCandidate",
            "<Tab>": "console.getCandidate",
            "<C-N>": "console.selectNextHistoryOrCandidate",
            "<C-P>": "console.selectPreviousHistoryOrCandidate",
            "<C-C>": "console.closeConsoleMode",
            "<Esc>": "console.closeConsoleMode",
            "<C-[>": "console.closeConsoleMode",
        }
    },

    "hintPattern": {
        "global": {
            "link": "*[onmousedown], *[onmouseup], *[onmouseover], *[onmouseout], *[onmousemove], *[onclick], *[oncommand], *[role='link'], *[role='button'], *[role='checkbox'], *[role='radio'], *[role='option'], input:not([type='hidden']):not([disabled]):not([readonly]), *[contenteditable='true'], *[contenteditable=''], a, button, select, textarea, area, summary, *[tabindex]:not([tabindex='-1'])",
            "focus": "body *",
            "media": "img, canvas, video, object, embed"
        },
        "local": {
            "twitter.com": {
                "link": [
                    ["div.new-tweets-bar.js-new-tweets-bar", "Link to display new tweets"],
                    ["div.dismiss.js-action-dismiss", "Dismiss button of recommended users"],
                    ["h1.Icon.Icon--bird.bird-topbar-etched", "Twitter icon on topbar"]
                ]
            }
        }
    },

    "searchEngine": {
        "defaultEngine": "google",
        "engines": {
            "google": {
                "searchUrl": "https://www.google.co.jp/search?q=%s&ie=utf-8&oe=utf-8&hl=ja",
                "suggest": {
                    "url": "https://suggestqueries.google.com/complete/search?client=firefox&hl=ja&qu=%s",
                    "type": "json",
                    "path": "$[1]",
                    "decode": false
                }
            },
            "twitter": {
                "searchUrl": "https://twitter.com/search?q=%s"
            }
        }
    }
};

