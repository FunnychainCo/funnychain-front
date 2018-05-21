

export function preLoadImage(src:string):Promise<string> {
    return new Promise<string>((resolve,reject) =>{
        let image = new Image();
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