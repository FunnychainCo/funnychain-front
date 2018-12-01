import * as dsteem from "dsteem";
import {USER_ENTRY_NO_VALUE, UserEntry} from "../../generic/UserEntry";
import {debugService} from "../../DebugService";

export class SteemCommunityAccountService {

    private _dSteemClient: dsteem.Client;
    private _accounts: any = {};
    private _currentAccount: string;
    private testNetwork: boolean;
    private _delegateUserEntry: UserEntry = USER_ENTRY_NO_VALUE;


    start(delegateUserEntry:UserEntry) {
        this._delegateUserEntry = delegateUserEntry;
        this.testNetwork = debugService.testNetwork;
        if (!this.testNetwork) {
            this._dSteemClient = new dsteem.Client('https://api.steemit.com');
            /* Register account */
            //steem private posting key
            this._accounts['steemzealot'] = {
                privateKey: dsteem.PrivateKey.fromString("5KgwVBfMsb8BEygDEuz2W1jz8jpXfqgAjcrcmumVm3hdNBj8g5n")
            };
            this._currentAccount = 'steemzealot';
        } else {
            let opts: any = {};
            //connect to community testnet
            opts.addressPrefix = 'STX';
            opts.chainId = '79276aea5d4877d9a25892eaa01b0adf019d3e5cb12a97478df3298ccdd01673';
            //connect to server which is connected to the network/testnet
            this._dSteemClient = new dsteem.Client('https://testnet.steem.vc', opts);
            /* Register account */
            //steem private posting key
            this._accounts['demo'] = {
                privateKey: dsteem.PrivateKey.fromString("5Jtbfge4Pk5RyhgzvmZhGE5GeorC1hbaHdwiM7pb5Z5CZz2YKUC")
            };
            this._currentAccount = 'demo';
        }
    }


    get dSteemClient(): dsteem.Client {
        return this._dSteemClient;
    }

    get accounts(): any {
        return this._accounts;
    }

    get delegateUserEntry(): UserEntry {
        return this._delegateUserEntry;
    }

    get currentAccount(): string {
        return this._currentAccount;
    }

    isCommunityAccount(uid:string){
        //TODO find/make a better discriminent for uid
        if(uid.length===28){
            return true;
        }else{
            return false;
        }
    }

    getCommunitySteemAccountName():string{
        return this._currentAccount;
    }

}


export let steemCommunityAccountService = new SteemCommunityAccountService();
