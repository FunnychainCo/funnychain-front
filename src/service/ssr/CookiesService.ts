import Cookies from 'universal-cookie';

export class CookiesService {

    cookies:any;

    start(cookies:string){
        if(cookies==""){
            this.cookies = new Cookies();
        }else{
            this.cookies = new Cookies(cookies);
        }
    }
}

export let cookiesService = new CookiesService();