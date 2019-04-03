export class ImageService {

    activated = false;

    constructor() {
        //activate image precache service after 15s to avoid slowing down initial load
        /*setTimeout(()=>{
            this.activated=true;
        },15000);*/
    }

    forceUrlToHttps(url: string): string {
        if (url.startsWith("https")) {
            return url;
        } else {
            url = url.replace("http", "https");
            return url;
        }
    }

    failIfNoHttps(url: string): void {
        if (!url.startsWith("https")) {
            throw new Error("no https on url => " + url);
        }
    }

    preLoadImage(src: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let image = new Image();
            //src = forceUrlToHttps(src);
            this.failIfNoHttps(src);
            image.src = src;
            image.onload = () => {
                //console.log("loaded image: "+src);
                resolve(src);
                console.log(image);
            };
            image.onerror = (e) => {
                reject(e);
            };
        })
    }

    getMimeTypeFromFile(file: File): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let blob = file; // See step 1 above
            let fileReader = new FileReader();
            fileReader.onloadend = (e: any) => {
                let arr = (new Uint8Array(e.target.result)).subarray(0, 4);
                let header = "";
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16);
                }
                resolve(this.getMimeType(header));
            };
            fileReader.readAsArrayBuffer(blob);
        })
    }

    getMimeType(headerString: string): string {
        //https://www.npmjs.com/package/file-type
        // Add more from http://en.wikipedia.org/wiki/List_of_file_signatures
        let type = "";
        switch (headerString) {
            case "89504e47":
                type = "image/png";
                break;
            case "47494638":
                type = "image/gif";
                break;
            case "ffd8ffe0":
            case "ffd8ffe1":
            case "ffd8ffe2":
                type = "image/jpeg";
                break;
            default:
                type = "unknown";
                break;
        }
        return type;
    }

}

export let imageService = new ImageService();