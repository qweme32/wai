// ==UserScript==
// @name         WAI.js
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Smart one-line translate
// @author       Qweme
// @include      https://*
// @include      http://*
// @grant        GM.xmlHttpRequest
// @grant        GM.registerMenuCommand
// @grant        GM.setValue
// @grant        GM_getValue
// ==/UserScript==

GM.registerMenuCommand ("Use MyMemory (5000 chars/day)", selectMyMemory);
GM.registerMenuCommand ("Use Google Translate ( Unlimited, but bad translation )", selectGoogle);

function selectMyMemory() {
    GM.setValue("wai-engine", "mm");
    console.log("[WAI.js] Engine setted to MyMemory");
    alert("[WAI.js] Engine setted to MyMemory");
}

function selectGoogle() {
    GM.setValue("wai-engine", "gt");
    console.log("[WAI.js] Engine setted to Google Translate");
    alert("[WAI.js] Engine setted to Google Translate");
}

class WaiCore {
    constructor() { }

    init() {
        this.state = {
            text: "",
            selected: false
        }
        this.selectionHook();
        console.log("[WAI.js] Init.");
    }

    replaceSelected(text) {
        const range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));

        console.log("[WAI.js] Text replaced.")
    }

    selectionHook() {
        document.addEventListener('mouseup', () => {
            const selectedText = window.getSelection().toString();

            if (selectedText.length > 0) {
                this.state.text = selectedText;
                this.state.selected = true;
            }
        });

        document.addEventListener("mousedown", () => {
            this.state.text = "";
            this.state.selected = false;
        })

        document.addEventListener("keydown", ev => {
            if (ev.code == "KeyT" && this.state.selected) {
                if (ev.defaultPrevented ||
                    /(input|textarea)/i.test(document.activeElement.nodeName)) {
                    return;
                }

                let engine = GM_getValue("wai-engine", "gt");

                console.log(`[WAI.js] Start translation via ${engine}`);

                if (engine == "gt") {
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=ru&q=" + this.state.text,
                        headers: {
                            "Content-Type": "application/json",
                            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0"
                        },
                        onload: (res) => {
                            this.replaceSelected(JSON.parse(res.response)[0][0][0]);
                        }
                    });
                } else if (engine == "mm") {
                    GM.xmlHttpRequest({
                        method: "GET",
                        url: "http://api.mymemory.translated.net/get?langpair=EN|RU&q=" + this.state.text,
                        headers: {
                            "Content-Type": "application/json",
                            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0"
                        },
                        onload: (res) => {
                            this.replaceSelected(JSON.parse(res.response)["responseData"]["translatedText"]);
                        }
                    });
                } else {
                    console.log("[WAI.js] Engine not found.")
                }

            }
        })

        console.log("[WAI.js] Hook done.")
    }
}

let wai;
window.onload = () => {
    wai = new WaiCore();
    wai.init();
}