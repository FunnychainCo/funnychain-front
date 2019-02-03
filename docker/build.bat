cd ..

call npm install
call npm outdated
call npm run testonce
call npm run build

rem docker run --rm -v %cd%:/home/gradle/project -w /home/gradle/project gradle gradle dockerBuildReleaseNPMInstall
rem gradlew dockerBuildRelease
docker build -t funnychain .

cd docker