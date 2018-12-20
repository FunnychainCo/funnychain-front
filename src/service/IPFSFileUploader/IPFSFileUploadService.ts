import {FileUploadServiceInterface, UploadedDataInterface} from "../generic/ApplicationInterface";
import * as ipfsAPI from "ipfs-api";
import axios from 'axios'
import {audit} from "../Audit";

export class IPFSFileUploadService implements FileUploadServiceInterface {

    //https://globalupload.io

    ipfsMainGatways: string[] = ["https://ipfs.funnychain.co/ipfs/", "https://ipfs.infura.io/ipfs/", "https://ipfs.io/ipfs/"];
    ipfsMainGatway = this.ipfsMainGatways[0];

    ipfsNodes: { host: string, port: string, protocol: string }[] = [];
    ipfsApis: any[] = [];

    start(): void {
        this.ipfsNodes.push({
            host: 'ipfs.funnychain.co',
            port: '5001',
            protocol: 'https'
        });

        this.ipfsNodes.push({
            host: 'ipfs.infura.io',
            port: '5001',
            protocol: 'https'
        });

        this.ipfsNodes.forEach(ipfsHost => {
            this.ipfsApis.push({
                api: ipfsAPI(ipfsHost),
                host: ipfsHost
            });
        });

        this.ipfsApis.forEach(ipfsApi => {
            ipfsApi.api.version((err, data) => {
                console.log("ipfs service started / version :", data.version + " / gateway :" + this.ipfsMainGatway, ipfsApi.host);
            });
        });
    }

    convertIPFSLinkToHttpsLink(link: string) {
        if (link.startsWith("ipfs://")) {
            link = link.replace("ipfs://", "");
        }
        return this.ipfsMainGatway + link;
    }

    convertHttpsLinkToIpfsLink(url: string): string {
        return "ipfs://" + this.convertIPFSLinkToIPFSHash(url);
    }

    convertIPFSLinkToIPFSHash(link: string) {
        return link.replace(this.ipfsMainGatway, "");
    }

    pin(ipfsId: string, ipfsApi: any): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const httpClient = axios.create();
            httpClient.defaults.timeout = 20000;//ms
            let url = ipfsApi.host.protocol + "://" + ipfsApi.host.host + ":" + ipfsApi.host.port + "/api/v0/pin/add?arg=" + ipfsId;
            httpClient.get(url).then(() => {
                resolve("ok");
            }).catch((err) => {
                audit.reportError("ipfs pin failed 1", err);
                reject("upload error");
            });
        });
    }

    pinMulti(ipfsId: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.ipfsApis.forEach(ipfsApi => {
                this.pin(ipfsId, ipfsApi);
            });
            resolve("ok");
        });
    }

    uploadBuffer(buffer: Buffer, progress: (progressPercent: number) => void, step: number = 0): Promise<UploadedDataInterface> {
        return new Promise<UploadedDataInterface>((resolveMain, rejectMain) => {
            return new Promise<UploadedDataInterface>((resolve, reject) => {
                if (step >= this.ipfsApis.length) {
                    reject("no more upload server available");
                    return;
                }
                let ipfsApi: any = this.ipfsApis[step];
                let ipfsId;
                progress(20);
                ipfsApi.api.add(buffer, {
                    progress: (prog) => {
                        progress(50);
                    }
                }, (err, response) => {
                    if (err !== null && response.length == 1) {
                        //console.log(response);
                        ipfsId = response[0].hash;
                        let imageLink = this.ipfsMainGatway + ipfsId;
                        console.log(imageLink);
                        progress(80);
                        resolve({
                            fileId: ipfsId,
                            fileURL: imageLink
                        });
                        this.pinMulti(ipfsId);//no need to wait for this
                        return;
                    } else {
                        reject("add failed");
                    }
                });
            }).then(value => {
                resolveMain(value);
            }).catch(reason => {
                step++;
                if (step >= this.ipfsApis.length) {
                    rejectMain("no more upload server available");
                } else {
                    this.uploadBuffer(buffer, progress, step).then(value => {
                        resolveMain(value);
                    }).catch(reason2 => {
                        rejectMain(reason2);
                    });
                }
            });
        });
    }

    uploadFile(file: File, progress: (progressPercent: number) => void): Promise<UploadedDataInterface> {
        progress(10);
        return new Promise<UploadedDataInterface>((resolve, reject) => {
            let reader = new (<any>window).FileReader();
            reader.onloadend = () => {
                const buffer = Buffer.from(reader.result);
                this.uploadBuffer(buffer, progress).then(value => {
                    resolve(value);
                }).catch(reason => {
                    reject(reason);
                });
            };
            reader.readAsArrayBuffer(file);
        })
    }

}

export let ipfsFileUploadService = new IPFSFileUploadService();
