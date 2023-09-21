// ==UserScript==
// @name         WAI.js
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       Qweme
// @include      https://*
// @include      http://*
// @grant        GM.xmlHttpRequest
// ==/UserScript==

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

    // onTextSelected()
    // https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=fr&q=Привет
    selectionHook() {
        document.addEventListener('mouseup', () => {
            const selectedText = window.getSelection().toString();

            if (selectedText.length > 0) {
                this.state.text = selectedText;
                this.state.selected = true;
            }
            //   // пользователь выделил текст
            //   console.log("Пользователь выделил текст:", selectedText);

            //   // заменить выделенный текст на "123"
            //   const range = window.getSelection().getRangeAt(0);
            //   range.deleteContents();
            //   range.insertNode(document.createTextNode("123"));
            // }
        });

        document.addEventListener("mousedown", () => {
            this.state.text = "";
            this.state.selected = false;
        })

        document.addEventListener("keydown", ev => {
            if (ev.code == "KeyT" && this.state.selected) {
                console.log("[WAI.js] Start translation...")
                GM.xmlHttpRequest({
                    method: "GET",
                    url: "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=auto&tl=ru&q=" + this.state.text,
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0"
                    },
                    onload: function (res) {
                        const range = window.getSelection().getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(document.createTextNode(JSON.parse(res.response)[0][0][0]));

                        console.log("[WAI.js] Text replaced.")
                    }
                });
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