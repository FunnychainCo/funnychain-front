
export class BackEndPropetiesProvider {

    properties={
        PROD_HOST:"beta.funnychain.co",
        AVATAR_GENERATION_SERVICE:"https://avatar.admin.rphstudio.net/avatar/get_secure_link.php",
        USERNAME_GENERATION_SERVICE:"https://avatar.admin.rphstudio.net/username"
    };
    prodProperties={};
    devProperties={};

    configFireBaseProd = {
        apiKey: "AIzaSyClb51m-dOtbsZ4xlzQrGu6xMhLlfxilCg",
        authDomain: "funnychain-b2243.firebaseapp.com",
        databaseURL: "https://funnychain-b2243.firebaseio.com",
        projectId: "funnychain-b2243",
        storageBucket: "funnychain-b2243.appspot.com",
        messagingSenderId: "428682484079"
    };

    configFireBaseDev = {
        apiKey: "AIzaSyAJC1BLZBe64zPsZHBIVBzGmPvH4FPSunY",
        authDomain: "funnychain-dev.firebaseapp.com",
        databaseURL: "https://funnychain-dev.firebaseio.com",
        projectId: "funnychain-dev",
        storageBucket: "funnychain-dev.appspot.com",
        messagingSenderId: "818676897965"
    };

    constructor() {
        var hostname = window && window.location && window.location.hostname;
        if(hostname === this.getProperty("PROD_HOST")) {
            Object.assign(this.properties,this.prodProperties,this.configFireBaseProd);
        }else{
            Object.assign(this.properties,this.devProperties,this.configFireBaseDev);
        }
    }

    getProperty(pptName) {
        return this.properties[pptName];
    }
}

export var backEndPropetiesProvider = new BackEndPropetiesProvider();
