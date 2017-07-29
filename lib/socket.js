'use strick';
const sio = require('socket.io');
const channels = require('./config').channels;
const uuid = require('uuid/v4');

class Socket {
    constructor(http, opts) {
        opts = opts ? opts : {};
        this.io = sio.listen(http);
        this.channelProcessFunctionMap = {};
        this.autoCleanTimespan = opts.autoCleanTimeSpan || 5; // 5 seconds
        this.overtime = opts.overtime || 5; // 5 seconds
        
        channels.forEach((channel) => {
            this.io.on('connection', (socket) => {
                socket.on(channel, (message) => this.subscribe(channel, socket, message));
            });
        });
    }

    bind(opts) {
        opts.forEach((item) => {
            const channel = item.channel;
            const callback = item.callback;
            this.channelProcessFunctionMap[channel] = callback;
        });
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

let socketObj = '';
module.exports = (http) => {
    if (!socketObj) {
        socketObj = new Socket(http);
    }
    return socketObj;
};
