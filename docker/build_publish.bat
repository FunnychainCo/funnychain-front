
call npm run testonce

cd ..
docker run --rm -v ./:/home/gradle/project -w /home/gradle/project gradle gradle dockerBuildRelease
cd docker

docker login
docker tag funnychain:latest registry.admin.rphstudio.net/funnychain:latest
docker push registry.admin.rphstudio.net/funnychain:latest