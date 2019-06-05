//pagination, loading, end cursor, new data available

export const DIRECTION_TOP : string = "TOP";
export const DIRECTION_BOTTOM : string = "BOT";

export interface PaginationCursor<U> {

    reset():void;
    isLoading():boolean;

    hasMore(direction?:string):boolean;
    loadMore(itemNumber:number,direction?:string):void;

    /** on new item available call loadMoreTop => direction is either "top" or "bottom" **/
    onNewDataAvailable(callback:(number:number,direction:string)=>void):()=>void;
    onDataSetCompleted(callback:(direction:string)=>void):()=>void;
    onData(callback:(data:U,direction:string)=>void):()=>void;
}

export interface ItemLoader<U>{
    requestItem(id:string);

    onData(callback:(id:string,data:U)=>void):()=>void;
}


export interface PaginationCursorFactoryInterface<T> {
    create():PaginationCursor<T>;
}