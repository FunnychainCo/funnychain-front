import {FileUploadServiceInterface, UploadedDataInterface} from "../generic/ApplicationInterface";
import * as ipfsAPI from "ipfs-api";
import axios from 'axios'

export class IPFSFileUploadService implements FileUploadServiceInterface {

    ipfsApi: any;

    //this.ipfsApi = ipfsAPI({host: 'ipfs.funnychain.co', port: '443', protocol: 'https'});
    //this.ipfsApi = ipfsAPI({host: 'ipfs.funnychain.co', port: '80', protocol: 'http'});
    //this.ipfsApi = ipfsAPI({host: 'localhost',port: '5001',protocol: 'http'});
    //https://ipfs.funnychain.co:443/api/v0/version?stream-channels=true
    ipfsHost: { host: string, port: string, protocol: string } = {
        host: 'ipfs.infura.io',
        port: '5001',
        protocol: 'https'
    };
    //ipfsGatway = "https://ipfs.io/ipfs/";
    ipfsGatway = "https://ipfs.infura.io/ipfs/";//faster since we pin to it ;)
    //https://globalupload.io

    start(): void {
        this.ipfsApi = ipfsAPI(this.ipfsHost);
        this.ipfsApi.version((err, data) => {
            console.log("ipfs service started / version :", data.version + " / gateway :"+this.ipfsGatway,this.ipfsHost);
        })
    }

    convertIPFSHashToIPFSLink(hash:string){
        return this.ipfsGatway+hash;
    }

    convertIPFSLinkToIPFSHash(link:string){
        return link.replace(this.ipfsGatway, "");
    }

    uploadBuffer(buffer: Buffer): Promise<UploadedDataInterface> {
        return new Promise<UploadedDataInterface>((resolve, reject) => {
            let ipfsId;
            this.ipfsApi.add(buffer, {progress: (prog) => console.log(`received: ${prog}`)})
                .then((response) => {
                    //console.log(response);
                    ipfsId = response[0].hash;
                    //https://gateway.ipfs.io/ipfs/QmWBXMoP1ocSBkQNJcNuYR229vFDkymBQeBfUzwK78U2CT
                    //INFO this fancy API is not working :/ => use HTTP
                    /*this.ipfsApi.pin.add(
                        {
                            "hash":ipfsId
                        }).then(()=>{
                        resolve({
                            fileId: ipfsId,
                            fileURL: "https://gateway.ipfs.io/ipfs/"+ipfsId
                        });
                    });*/
                    const httpClient = axios.create();
                    httpClient.defaults.timeout = 20000;//ms
                    let url = this.ipfsHost.protocol + "://" + this.ipfsHost.host + ":" + this.ipfsHost.port + "/api/v0/pin/add?arg=" + ipfsId;
                    httpClient.get(url).then(() => {
                        let imageLink = this.ipfsGatway + ipfsId;
                        console.log(imageLink);
                        resolve({
                            fileId: ipfsId,
                            fileURL: imageLink
                        });
                    });
                }).catch((err) => {
                console.error(err)
            })
        });
    }

    uploadFile(file: File): Promise<UploadedDataInterface> {
        return new Promise<UploadedDataInterface>((resolve, reject) => {
            let reader = new (<any>window).FileReader();
            reader.onloadend = () => {
                const buffer = Buffer.from(reader.result);
                this.uploadBuffer(buffer).then(value => {
                    resolve(value);
                });
            };
            reader.readAsArrayBuffer(file);
        })
    }

}

export let ipfsFileUploadService = new IPFSFileUploadService();
