cd ..
call npm install pixi.js --save
call npm install angular2pixi --save
call npm i --save stompjs
call npm i --save sockjs-client
call npm i --save ng2-stomp-service
call ionic cordova build browser
cd docker
#rm -R ./www
rmdir /s/q .\www\
xcopy /s .\..\www .\www\
#cp -R ../www ./
docker build -t jungle-js .
docker image save jungle-js:latest -o jungle-js-latest.docker_image