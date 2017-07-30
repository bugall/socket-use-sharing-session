'use strick';
const sio = require('socket.io');
const uuid = require('uuid/v4');
const _ = require('lodash');

class Socket {
    constructor(http, opts) {
        opts = opts ? opts : {};
        this.io = sio.listen(http);
        this.channelProcessFunctionMap = {};
        this.autoCleanTimespan = opts.autoCleanTimeSpan || 5; // 5 seconds
        this.overtime = opts.overtime || 5; // 5 seconds
        
        this.bind(opts);
        this.io.on('connection', (socket) => {
            console.log(socket.handshake.session);
            socket.on('message', (data) => this.subscribe(socket, data));
        });
    }
    bind(opts) {
        for(let channel in opts) {
            const callback = opts[channel];
            this.channelProcessFunctionMap[channel] = callback;
        }
    }
    subscribe(socket, data) {
        const serverMessageId= uuid();
        const timestamp = Date.parse(new Date());
        data = typeof data === 'string' ? JSON.parse(data) : data;
        const channel = data.channel;

        this.channelProcessFunctionMap[serverMessageId] = { 
            serverMessageId: serverMessageId, 
            socket: socket, 
            channel: channel,
            clientMessageId: data.clientMessageId,
            timestamp:  timestamp
        };
        
        data.serverMessageId= serverMessageId;

        this.channelProcessFunctionMap[channel](data).then((result) => {
            if (!_.isEmpty(this.channelProcessFunctionMap[result.serverMessageId])) {
                const { socket, channel, clientMessageId } = this.channelProcessFunctionMap[result.serverMessageId];
                result.channel = channel;
                result.clientMessageId = clientMessageId;
                result.type = typeof result === 'string' ? 'string' : 'object';
                
                socket.emit('message', result);
                this.clean(result.serverMessageId);
            }
        }).catch((err) => {
            console.log(err.stack);
        });
    }
    clean(serverMessageId) {
        delete this.channelProcessFunctionMap[serverMessageId];
    }
    cleanupTimeoutRequest() {
        Object.keys(this.channelProcessFunctionMap).forEach((serverMessageId) => {
            const now = Date.parse(new Date());
            if (this.channelProcessFunctionMap[serverMessageId].timestamp - now < 5000) {
                this.clean(serverMessageId);
            }
        });
    }
};

let socketObj = '';
module.exports = (http, opts) => {
    if (!socketObj) {
        socketObj = new Socket(http, opts);
    }
    return socketObj;
};
