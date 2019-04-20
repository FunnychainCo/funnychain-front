export class SSRCache{
    cache:any={};

    setCache(key:string,data:any){
        this.cache[key]=data;
    }

    getCache(key:string):any{
        return this.cache[key];
    }
}

export let ssrCache = new SSRCache();