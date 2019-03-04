cd ..

docker build -t funnychain .

docker login
docker tag funnychain:latest registry.admin.rphstudio.net/funnychain:latest
docker push registry.admin.rphstudio.net/funnychain:latest

cd docker