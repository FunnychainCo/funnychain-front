//setup
Install tools:
Node JS
Git
Xcode
sudo npm install ionic -g
sudo npm install cordova -g
sudo xcodebuild -license
sudo gem install cocoapods
pod setup

//build
run build_app.sh

//Publish
//https://ionicframework.com/docs/publishing/app-store

//on https://developer.apple.com/account/ios/profile/
//Create a production certificat + An App ID + A provisioning Profile
From here, open the .xcworkspace file in ./platforms/ios/ to start XCode.
Click on the root of the project then go to Signing










//////////////////////////////
//OLD
//////////////////////////////
bInstall tools:
Mercurial
JDK8
Mavenn 3.5.0
Netbeans 8.2
NodeJS 6.7.0
Ionic
Xcode
To deploy iOS app
https://ionicframework.com/docs/intro/deploying/
rm src in smillan-dev (supprimer le fichier src)
in smillan-dev => hg clone https://pierreh37@bitbucket.org/smilanteam/smilan ./src
(hg update/pull)
            ( commande situe dans le fichier smillan dev, recupere donnees de bitbucket)
copy properties from blackbox to src/main/mobile/ionic-src/src/assets/src/properties
 ( blackbox = adresse du serveur et mdp, recuperer ce fichier de ph properties.js)
change icon-ios-512x512.png to icon.png in mobile/ionic-src/resources
Increment version in config.xml (dans ionic-src, change version 00.x+1)
change id to com.smillan.mobile2 in config.xml. (id="com.smillan.mobile2")
move to ionic-src (cd et ls)
ionic cordova platform rm ios 
ionic cordova platform add ios (error?)
ionic cordova resources (fais les tailles image pour ios)
(Dans le config.xml jeter les fichiers ios
//ionic cordova emulate ios
Open the .xcodeproj file in platforms/ios/ in Xcode
    Go to project page (double clik smillan)
    Uncheck automatically manage signing
    Select SmillanDistProfile in both signing Debug and Release
(back console)
ionic cordova build ios --prod --release
cordova platform update ios
Open the .xcodeproj file in platforms/ios/ in Xcode. (Smillan.xcodeproj
    Product archive( en haut)
to update:
sudo npm install -g ionic@latest
sudo npm -g install ionic cordova
Sudo npm install -g ios-deploy --unsafe-perm=true
cordova plugin save
sudo rm -R /Users/cedric/Smillan-dev/src/main/mobile/ionic-src/platforms