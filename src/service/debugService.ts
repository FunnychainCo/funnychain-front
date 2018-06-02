export class DebugService {
    private _testNetwork = false;


    get testNetwork(): boolean {
        return this._testNetwork;
    }

    set testNetwork(value: boolean) {
        console.log("test network : "+value);
        this._testNetwork = value;
    }
}

export let debugService = new DebugService();