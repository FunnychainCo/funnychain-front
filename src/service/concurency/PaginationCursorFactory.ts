import {
    DIRECTION_BOTTOM,
    DIRECTION_TOP,
    PaginationCursor,
    PaginationCursorFactoryInterface
} from "./PaginationInterface";
import EventEmitter from "eventemitter3";
import {SplitCursor, SplitCursorData} from "./Cursor";

export class PaginationCursorFactory implements PaginationCursorFactoryInterface<string> {

    private eventEmitter = new EventEmitter();
    refCursor: SplitCursorData = new SplitCursorData();

    addKeyBottom(id:string):void{
        this.refCursor.addBottom(id);
        this.eventEmitter.emit("new_keys_available", 1,DIRECTION_BOTTOM);
    }

    addKeyTop(id:string):void{
        this.refCursor.addTop(id);
        this.eventEmitter.emit("new_keys_available", 1,DIRECTION_TOP);
    }

    create(): PaginationCursor<string> {
        let self = this;
        return new class implements PaginationCursor<string> {
            cursor: SplitCursor = new SplitCursor(self.refCursor);
            remove: ()=>void = ()=>{};

            hasMore(direction?:string): boolean {
                direction = direction?direction:DIRECTION_BOTTOM;
                return false;
            }

            isLoading(): boolean {
                return true;
            }

            loadMore(number: number,direction?:string): void {
                direction = direction?direction:DIRECTION_BOTTOM;
                for(let i = 0;i<number;i++) {
                    let key = direction===DIRECTION_BOTTOM?this.cursor.nextBottom():this.cursor.nextTop();
                    if(!key){
                        return;
                    }
                    let hasNext = direction===DIRECTION_BOTTOM?this.cursor.hasNextBottom():this.cursor.hasNextTop();
                    self.eventEmitter.emit("new_key",key,!hasNext,direction);
                }
            }

            onData(callback: (key: string,final:boolean,direction:string) => void): () => void {
                self.eventEmitter.on("new_key", callback);
                return () => {
                    self.eventEmitter.off("new_key", callback);
                };
            }

            onNewDataAvailable(callback: (number:number,direction:string) => void): () => void {
                self.eventEmitter.on("new_keys_available", callback);
                return () => {
                    self.eventEmitter.off("new_keys_available", callback);
                };
            }

            reset(): void {
                this.cursor = new SplitCursor(self.refCursor);
            }
        };
    }
}
