copy ..\build\** .\src\
call ionic cordova resources
call ionic cordova build android --production
call ionic cordova build android --production --release