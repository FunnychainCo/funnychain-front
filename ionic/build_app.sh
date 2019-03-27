#!/bin/sh
npm install
ionic cordova plugin add onesignal-cordova-plugin
ionic cordova plugin add cordova-plugin-local-notification
npm install @ionic-native/local-notifications --save
ionic cordova plugin add cordova-plugin-badge
npm install @ionic-native/badge --save
ionic cordova plugin add cordova-plugin-ios-camera-permissions --save
npm outdated
ionic cordova resources
ionic cordova prepare ios
ionic cordova build ios --prod --release