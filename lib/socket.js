'use strick';
const sio = require('socket');
const routesInfo = require('./config').routesInfo;
const uuid = require('uuid/v4');

class Socket {
    constructor(http, opts) {
        this.io =  sio(http);
        this.channelProcessFunctionMap = {};
        this.autoCleanTimespan = opts.autoCleanTimeSpan || 5; // 5 seconds
        this.overtime = opts.overtime || 5; // 5 seconds
        
        routesInfo.forEach((channel) => {
            this.io.on('connection', (socket) => {
                socket.on(channel, (message) => this.subscribe(channel, socket, message));
            });
        });
    }

    bind(channel, callback) {
        if (typeof callback === 'object' && typeof callback.then === 'function') {
            this.channelProcessFunctionMap[channel] = callback;
        } else {
            throw new Error('Callback must be a Promise object');
        }
    }
    receive() {
    }
    subscribe(channel, socket, message) {
        const replyId = uuid();
        const timestamp = Date.parse(new Date());
        message = typeof message === 'string' ? JSON.parse(message) : message;

        this.channelProcessFunctionMap[replyId] = { 
            replyId: replyId, 
            socket: socket, 
            channel:channel,
            userRequestId: message.id,
            timestamp:  timestamp,
            reponseMessage: null
        };
    
        this.channelProcessFunctionMap[channel](message).then((result) => {
            if (_.isEmpty(this.channelProcessFunctionMap[result.replyId])) {
                const socket = this.channelProcessFunctionMap[result.replyId].socket;
                const channel = this.channelProcessFunctionMap[result.replyId].channel;
                socket.emit(channel, result);
                this.clean(result.replyId);
            }
        });
    }
    clean(replyId) {
        delete this.channelProcessFunctionMap[replyId];
    }
    cleanupTimeoutRequest() {
        Object.keys(this.channelProcessFunctionMap).forEach((replyId) => {
            const now = Date.parse(new Date());
            if (this.channelProcessFunctionMap[replyId].timestamp - now < 5000) {
                this.clean(replyId);
            }
        });
    }
};
