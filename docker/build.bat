cd ..

call npm install
call npm outdated
rem call npm run test
call npm run build

RMDIR /s /q .\docker\build\
xcopy .\build .\docker\build\ /s /e
copy .\package.json .\docker\build\
copy .\package-lock.json .\docker\build\

cd docker

rem docker run --rm -v %cd%:/home/gradle/project -w /home/gradle/project gradle gradle dockerBuildReleaseNPMInstall
rem gradlew dockerBuildRelease
docker build -t funnychain .
