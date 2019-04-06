import {audit} from "./Audit";
import store from 'store';
import {deviceDetector} from "../mobile/DeviceDetector";

export class Report {

    //TODO
    //1 create a local censur list
    //2 notify in kibana

    readonly STORAGE_KEY_REPORT_LOCAL: string = "fc.report.local";

    reportedContent: { [id: string]: { [id: string]: string } } = {};//{[id: type]: {[id: contentid]: contentid}}

    start() {
        this.reportedContent = store.get(this.STORAGE_KEY_REPORT_LOCAL) || {};
        let blehmemewebp = [
            "QmQbt1wkDFW2shdrrohQiBCF6xwZqqD5D5m86wMMXnosAf",
            "QmdqQMDmkqYz2uPrNEBavWofHWHqmFZEp6wSqYfHZeAcZg",
            "QmXNh3phwjq1ff8FsBFvU9Wd63cpb7iRewimp698dt9ibr",
            "QmQGMa72eXEYVrusJfEyviJmdCatvbBR8Ak53ztNHSFnZT",
            "QmNsUcvmPbjb2Y1X6RPeB1snRKCSh5x1vucTcsAddGgErJ",
            "QmXdr68uC9FohZ8WQQT928iaW2oshZutWjwSX3m9eESbkL",
            "QmTXbfoftHRWQkYuKbKw3pT956xM4DAALe3VszLt4WSpgN",
            "QmaXM3th8dhWTuVHQHoTgHgs9ota5QCbud5HPEXP6xii7W",
            "QmfX6vW2xgvtbw9yjoJjg9yzUcSLj1eWhugnwVxKwwntCs",
            "QmUFwr8Rirwo9SeasiCMyyCdSzuQ6si4wvnNE6jsdgHvTj",
            "QmUt5cGPaVQX5ZNAyN6D86hVeUefrgUZ2TcMDFhrSRCk49",
            "QmfDVpcB16zK7cXSVWkR6KBDrBnpmWugNu29BDffYnZjnE",
            "QmT2s8sHDc59WeRTKGXbKSwpd32qBRgvhPyz7utHXMQpnp",
            "QmPpbHHRHSA1wctF9P1bPqRNps5hqENWGDYSjVRcY7mCKP",
            "QmVz31KDFaw9jsPKpnishjAdXn7hXbJbMWQfK7GPAcjJoD",
            "QmWX2DLTrD2Ue3rcLvqSd9iVU1ikjivnsJ24e9bWRMP3fW",
            "QmcJSwbdfbJmPGbBqPx6U1tq8Ua6gh8VSqTwFAjAoWwwRV",
            "QmNbkMkjRigCqJA1SCcqgaF9RdTN8ffSgrTLUxck9HNJWX",
            "QmcxCPE3nJJnM6dpe3px5W7LE3ys2STB5BLTmHTiCsFJDN",
            "QmQVhsChbdVzPBCDPerr793QBuRf8Jcx9BaFrZnqNAYm2T",
            "QmRnc8rSJkz5hbKRYbf3bLLMmQ2mirsfdzH2z2pNqSH6CV",
            "QmYKAbgfpq7aVVZ53aZG2zKNtS3Q1m2EYAQja63Jj38fWF",
            "QmRGaqTRqWPLxWvR2dRJZCXxbRXjxvSUM9ZmwFUXJBxbPq",
            "QmQP622ZaEs3jwB5FvffaHhpM8ob62f8X5x3Z33M4uS44m",
            "Qmenyv7vJZnzjxCwGuJuYFDM2XRNBoAUK31vXBEgAH82uo",
            "Qmf6xPHDWCohZ6evz4J87M8U9dLSoZh52GC18u7KFEAJnD",
            "QmXN1oEV8ZCSVgHck4sJQcmHLq3ijWrNhJp9UxMpTQSbKr",
            "QmVbwkiLEwLjGh9CQ5fYTqyQeCkNeMG2f8oZBy8kCNXAv7",
            "QmUQmeq6tDZAFVPspCknuHWfb73RYgYfUYmWffkWx5yEfW",
            "QmXC9Zy9FbfnArBKZzkA2RxD5UT9BueiqGyjQ4unYsvrAK",
            "QmYap6DD2qxqMWYKHGNfTGAPh65VkF7tmjzUTRdoCMcyzL",
            "QmZJrcpTpq5RhwtF8zuys2CMhgg1jHQySuC3xJd1iGsPLv",
            "QmdeRV8FtZW1zFqZWFKCHmMGVM6ns7fGbPp68pq68we5GJ",
            "QmSiyT8F5rPfXCAUuEnYCeCQEkeK38NZNGgjgZtJuT1Doh",
            "QmXpiLjDZXSZmPgWVUxXtomqxu8ryCH422KsXNDJbWE57k",
            "QmeeTNhrekm551bNoATdYAW6BBFMt9sTcQEPXrywVEtufh",
            "QmeeTNhrekm551bNoATdYAW6BBFMt9sTcQEPXrywVEtufh",
            "QmP7b9LbDQCW3o2sA87i9yziKgUPtscTta68CZz89NATDy"];


        if(deviceDetector.isIPhone()) {
            this.reportedContent["meme"] = {};
            blehmemewebp.forEach(value => {
                this.reportedContent["meme"][value] = value;
            });
        }
    }

    getReportedContent(type:string): { [id: string]: string }{
        return this.reportedContent[type]?this.reportedContent[type]:{};
    }

    reportContent(type: string, contentId: string): void {
        console.log("report content:" + contentId);
        if (!this.reportedContent[type]) {
            this.reportedContent[type] = {};
        }
        this.reportedContent[type][contentId] = contentId;
        store.set(this.STORAGE_KEY_REPORT_LOCAL, this.reportedContent);
        audit.track("user/flag", {flagid: contentId, type: type});
    }

    reportUser(userId: string): void {
        console.log("report user:" + userId);
        if (!this.reportedContent["user"]) {
            this.reportedContent["user"] = {};
        }
        this.reportedContent["user"][userId] = userId;
        store.set(this.STORAGE_KEY_REPORT_LOCAL, this.reportedContent);
        audit.track("user/flag", {flagid: userId, type: "user"});
    }

}

export let report = new Report();