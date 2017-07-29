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
        
        let channels = null;
        if (opts) {
            channels = Object.keys(opts);
            this.bind(opts);
        }
        
        channels.forEach((channel) => {
            this.io.on('connection', (socket) => {
                socket.on(channel, (message) => this.subscribe(channel, socket, message));
            });
        });
    }

    bind(opts) {
        for(let channel in opts) {
            const callback = opts[channel];
            this.channelProcessFunctionMap[channel] = callback;
        }
    }
    subscribe(channel, socket, message) {
        const replyId = uuid();
        const timestamp = Date.parse(new Date());
        message = typeof message === 'string' ? JSON.parse(message) : message;

        this.channelProcessFunctionMap[replyId] = { 
            replyId: replyId, 
            socket: socket, 
            channel:channel,
            userRequestId: message.requestId,
            timestamp:  timestamp,
            reponseMessage: null
        };
        
        message.replyId = replyId;
        this.channelProcessFunctionMap[channel](message).then((result) => {
            if (!_.isEmpty(this.channelProcessFunctionMap[result.replyId])) {
                const socket = this.channelProcessFunctionMap[result.replyId].socket;
                const channel = this.channelProcessFunctionMap[result.replyId].channel;
                result['channel'] = channel;
                socket.emit('message', result);
                this.clean(result.replyId);
            }
        }).catch((err) => {
            console.log(err.stack);
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

let socketObj = '';
module.exports = (http, opts) => {
    if (!socketObj) {
        socketObj = new Socket(http, opts);
    }
    return socketObj;
};
