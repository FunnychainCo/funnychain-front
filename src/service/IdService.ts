export class IdService {
    makeid():string {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 64; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return "0" + text;//version 0 of the file id
    }
}

export let idService = new IdService();