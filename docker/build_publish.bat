IF [%1] == [] GOTO error

docker login

call build.bat

docker tag funnychain:latest registry.funnychain.co/funnychain:latest
docker push registry.funnychain.co/funnychain:latest

docker tag funnychain:latest registry.funnychain.co/funnychain:%1
docker push registry.funnychain.co/funnychain:%1


GOTO :EOF
:error
ECHO incorrect_parameters