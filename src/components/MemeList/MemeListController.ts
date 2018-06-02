export class MemeListController {
    callback:(cat:string)=>void = cat => {};
    currentCategory = "";

    registerCallBack(callback:(cat:string)=>void){
        this.callback=callback;
        this.callback(this.currentCategory);
    }

    applyCat(category:string){
        this.currentCategory = category;
        this.callback(category);
    }

}

export let memeListController = new MemeListController();