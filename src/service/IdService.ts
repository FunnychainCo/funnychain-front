export class IdService {
    makeid():string {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 64; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return "0" + text;//version 0 of the file id //TODO make this cleaner
    }

    makeidAlpha(length:number):string {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
}

export let idService = new IdService();