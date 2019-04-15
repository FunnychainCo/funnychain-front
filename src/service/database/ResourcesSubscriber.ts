export class ResourcesSubscriber {

    constructor(private socket: SocketIOClient.Socket) {

    }

    on(resource: string, event: string, callback: (resource: any) => void): () => void {
        let listener = (data: { resource: string, event: string, JSONStringdata: string }) => {
            //console.log(data);
            if (data.resource === resource) {
                if (data.event === event) {
                    callback(JSON.parse(data.JSONStringdata));
                }
            }
        };
        //send join room event
        this.socket.emit('resource-room-join', {resource: resource});
        this.socket.on('resource-room-message', listener);
        return () => {
            //send join room event
            this.socket.emit('resource-room-leave', {resource: resource});
            this.socket.off('resource-room-message', listener);
        };
    }
}