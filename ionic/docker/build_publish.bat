docker login

docker build -t funnychain-mobile-android --file DockerfileAndroid .
docker tag funnychain-mobile-android:latest registry.admin.rphstudio.net/funnychain-mobile-android:latest
docker push registry.admin.rphstudio.net/funnychain-mobile-android:latest

docker build -t funnychain-mobile-ios --file DockerfileIOS .
docker tag funnychain-mobile-ios:latest registry.admin.rphstudio.net/funnychain-mobile-ios:latest
docker push registry.admin.rphstudio.net/funnychain-mobile-ios:latest

