
export function forceUrlToHttps(url:string):string{
    if(url.startsWith("https")){
        return url;
    }else{
        url = url.replace("http","https");
        return url;
    }
}

export function failIfNoHttps(url:string):void{
    if(!url.startsWith("https")){
        throw new Error("no https on url => "+url);
    }
}

export function preLoadImage(src:string):Promise<string> {
    return new Promise<string>((resolve,reject) =>{
        let image = new Image();
        //src = forceUrlToHttps(src);
        failIfNoHttps(src);
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