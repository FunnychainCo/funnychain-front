cd ..

call npm install
call npm outdated
call npm run testonce
call npm run build

RMDIR /s /q .\docker\build\
xcopy .\build .\docker\build\ /s /e

cd docker

rem docker run --rm -v %cd%:/home/gradle/project -w /home/gradle/project gradle gradle dockerBuildReleaseNPMInstall
rem gradlew dockerBuildRelease
docker build -t funnychain .
