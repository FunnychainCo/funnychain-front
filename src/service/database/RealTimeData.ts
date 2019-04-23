import {GLOBAL_PROPERTIES} from "../../properties/properties";

const socketiocli = require('@feathersjs/socketio-client');
import io from 'socket.io-client';
import {ResourcesSubscriber} from "./ResourcesSubscriber";
let feathers = require('@feathersjs/feathers');

export class RealTimeData{
    private app: any;
    private socket: SocketIOClient.Socket;
    private resourceSubscriber: ResourcesSubscriber;
    constructor(){
    }

    connect(){
        let split = GLOBAL_PROPERTIES.REAL_TIME_SERVICE_HOST().split("#");
        this.socket = io(split[0],{
            path: split[1]
        });
        console.log("Realtime service connected to: "+ this.socket.io.opts.hostname+"/"+this.socket.io.opts.path);
        this.app = feathers();
        // Set up Socket.io client with the socket
        this.app.configure(socketiocli(this.socket));

        this.resourceSubscriber = new ResourcesSubscriber(this.socket);
    }


    getResoureSubscriber():ResourcesSubscriber{
        return this.resourceSubscriber;
    }

    getApp(){
        return this.app;
    }

    getSocketIo(){
        return this.socket;
    }
}

export let realTimeData = new RealTimeData();