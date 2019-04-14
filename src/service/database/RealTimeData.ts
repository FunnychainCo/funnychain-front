import {GLOBAL_PROPERTIES} from "../../properties/properties";

const socketiocli = require('@feathersjs/socketio-client');
const io = require('socket.io-client');
let feathers = require('@feathersjs/feathers');

export class RealTimeData{
    private app: any;
    constructor(){
    }

    connect(){
        const socket = io(GLOBAL_PROPERTIES.FUNNYCHAIN_SERVICE());
        this.app = feathers();
        // Set up Socket.io client with the socket
        this.app.configure(socketiocli(socket));
    }

    getApp(){
        return this.app;
    }
}

export let realTimeData = new RealTimeData();