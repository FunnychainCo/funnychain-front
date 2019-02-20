#!/bin/sh
sudo npm install -g ionic@latest
sudo npm install -g cordova@latest
npm install
ionic cordova plugin add onesignal-cordova-plugin
ionic cordova plugin add cordova-plugin-local-notification
npm install @ionic-native/local-notifications --save
ionic cordova plugin add cordova-plugin-badge
npm install @ionic-native/badge --save
npm outdated
ionic cordova resources
ionic cordova prepare ios
ionic cordova build ios --prod --release