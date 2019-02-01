import store from 'store';

export class DebugService {
    private _testNetwork:any = store.get("fc.debug.testnetwork") || false;

    get testNetwork(): boolean {
        return this._testNetwork;
    }

    set testNetwork(value: boolean) {
        console.log("test network : "+value);
        this._testNetwork = value;
        store.set("fc.debug.testnetwork",value);
    }
}

export let debugService = new DebugService();