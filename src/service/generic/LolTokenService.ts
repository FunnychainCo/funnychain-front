export class LolTokenService {

    convertLolToEuroValue(lolValue: number): number {
        return lolValue*(5/6500);//5euro == 6500token
    }

    convertEuroToLolValue(euroValue: number): number {
        return euroValue*(6500/5);//5euro == 6500token
    }
}

export let lolTokenService = new LolTokenService();