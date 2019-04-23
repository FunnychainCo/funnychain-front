// tslint:disable:no-console
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.2.0/workbox-sw.js');
console.log('custom service worker V1.0 installed');
if (workbox) {
    console.log(`Workbox is loaded 🎉`);
    workbox.routing.registerRoute(
        /\.(?:js|css|html)$/,
        workbox.strategies.networkFirst(),
    );
} else {
    console.log(`Workbox didn't load 😬`);
}
