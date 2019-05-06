del .\funnychain-signed.apk
copy /b/v/y .\resources\android-icon.png .\resources\icon.png
call ionic cordova platform add android
call ionic cordova platform add ios
call ionic cordova plugin add onesignal-cordova-plugin
call ionic cordova plugin add cordova-plugin-inappbrowser
call ionic cordova plugin add cordova-plugin-local-notification
call npm install @ionic-native/local-notifications
call ionic cordova plugin add cordova-plugin-badge
call npm install @ionic-native/badge
call npm install
call npm outdated
rd /s /q .\www
call ionic cordova resources
call ionic cordova build android --prod --release
call jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore funnychain2-release-key.keystore -storepass funnychain -keypass funnychain .\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk funnychain
call D:\Documents\AppData\AndroidSdk\AndroidSdk\build-tools\28.0.3\zipalign -v 4 .\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk funnychain-signed.apk
copy .\www .\docker\wwwAndroid