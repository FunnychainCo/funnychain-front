function getConfig() {
    let host = "http://localhost/"
    return [
        host+"140.js",
        host+"142.js",
        host+"2.js",
        host+"4.js",
        host+"5.js",
        host+"7.js",
        host+"8.js",

        host+"common.js",
        host+"runtime.js",
        host+"polyfills.js",
        host+"cordova.js",
        host+"main.js"];
}
/*function getConfig() {
    let host = "http://localhost/"
    return [
		"http://localhost/140.32ff839cbecdfbae5ef9.js",
        "http://localhost/142.99ac6dd75ac9e76b33ca.js",
        "http://localhost/2.3154128880d8d976d18b.js",
        "http://localhost/4.25c4b1af95554d5b7a35.js",
        "http://localhost/5.dbafdf454c8533d63655.js",
        "http://localhost/7.164c026cc95acdf040c8.js",
        "http://localhost/8.ba43d5915837070900d8.js",
        "http://localhost/common.5b346355870338c70113.js",
        host+"cordova.js",
        "http://localhost/main.4f3d6ed0d745c721bad5.js",
        "http://localhost/polyfills.c93868e02b280428b068.js",
        "http://localhost/runtime.32db207ab489ee8a8241.js"];
}*/
/*function getConfig() {
    let host = "https://ipfs.funnychain.co/ipfs/"
    return [
		host+"QmR1kebG3Ug56nHXPGWtcEjpfw3nksSnyFTVNcyyVC5S86",
        host+"QmeTEa7HUBJRpP8tsbmeGb52mq3KPYFXqphzokdgiuTxWL",
        host+"QmR63aNiMvs8oET3JpJaFatY796ynNpxKUX35KabPcnQcP",
        host+"QmYamyS9ULvjHzKosbZXhucuZRhYnkJKLxa3W2Q8bGqYDb",
        host+"QmRKDEvHgwoMcHtMnbCdoDUbXBpEhiiGbYDNVEtBsAFqd4",
        host+"QmXpipmvaGJFSwhtb5UTwo1vCkTTPLgDGBaeGc3tW9JuRK",
        host+"QmQx1GLmLh5BJikvhvB7oz6GM25Rpw16w1i4fTFhWamA9j",
        host+"QmQBs5ti1jcw1LE1VaxxxfQA9h7JDNTu343kGRLzkUQLAG",
        host+"QmUBHvzba1n9EMbxDHedQm6s6GjWTP7c93Sgz9HE2VaKUZ",
        host+"QmdfLGepCQ3yratkPiS62C7Tpo9K5BFD2MfADe5x1f6J3M",
        host+"QmcXkSarXJCjf5ZCuX2ZeoiEWZmfd68fP34zeESnwX6BA4",
        host+"QmNm4P6G7Zi1gkE2CkmA1vFRLP23dFU6fWbhxDapgCADSr",
        host+"QmRLm8arXczG7YLJdxDcENNnXfEHV283my3qtiNfxMvmtx",
        host+"QmSfrptjGNorLR3MS7TNVEfovrXmJFgUmNL9NfckkmfJvx",
        host+"QmU7CjmVVR24zVTxT3BA9XWJHBafR9XuUXS6o1kqVd9ADq"];
}*/
window.postMessage({type:"send_config",data:getConfig()}, '*');