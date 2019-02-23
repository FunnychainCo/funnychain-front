function getConfig() {
    let host = "http://localhost/";
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
window.postMessage({type:"send_config",data:getConfig()}, '*');