docker login

call build.bat

docker tag funnychain:latest registry.admin.rphstudio.net/funnychain:latest
docker push registry.admin.rphstudio.net/funnychain:latest