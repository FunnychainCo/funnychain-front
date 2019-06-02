export class SplitCursorData{
    container: string[] = [""];
    lengthTop = 1;
    lengthBottom = 1;

    addTop(value:string):void{
        this.container[this.lengthTop] = value;
        this.lengthTop++;
    }
    addBottom(value:string):void{
        this.container[-this.lengthBottom] = value;
        this.lengthBottom++;
    }

}

export class SplitCursor{
    cursorTop = 0;
    cursorBottom = 0;
    constructor(private data:SplitCursorData){}

    nextTop():string{
        if(this.hasNextTop()){
            this.cursorTop++;
            return this.data.container[this.cursorTop];
        }
        return null;
    }

    hasNextTop():boolean{
        return this.cursorTop<this.data.lengthTop-1;
    }

    hasNextBottom():boolean{
        return this.cursorBottom<this.data.lengthBottom-1;
    }

    nextBottom():string{
        if(this.hasNextBottom()){
            this.cursorBottom++;
            return this.data.container[-this.cursorBottom];
        }
        return null;
    }
}