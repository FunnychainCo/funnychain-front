export class LolTokenService {

    rate:number = 5/5000000; //5euro == 500token

    setRate(rate:number){
        this.rate = rate;
    }

    convertLolToEuroValue(lolValue: number): number {
        return lolValue*(this.rate);
    }

    convertEuroToLolValue(euroValue: number): number {
        return euroValue*(1/this.rate);//5euro == 6500token
    }
}

export let lolTokenService = new LolTokenService();