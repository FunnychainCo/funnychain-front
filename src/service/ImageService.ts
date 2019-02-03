export class ImageService {

    activated = false;

    constructor(){
        //activate image precache service after 15s to avoid slowing down initial load
        /*setTimeout(()=>{
            this.activated=true;
        },15000);*/
    }

    forceUrlToHttps(url:string):string{
        if(url.startsWith("https")){
            return url;
        }else{
            url = url.replace("http","https");
            return url;
        }
    }

    failIfNoHttps(url:string):void{
        if(!url.startsWith("https")){
            throw new Error("no https on url => "+url);
        }
    }

    preLoadImage(src:string):Promise<string> {
        return new Promise<string>((resolve,reject) =>{
            let image = new Image();
            //src = forceUrlToHttps(src);
            this.failIfNoHttps(src);
            image.src = src;
            image.onload = () => {
                //console.log("loaded image: "+src);
                resolve(src);
            };
            image.onerror = (e) => {
                reject(e);
            };
        })
    }
}

export let imageService = new ImageService();