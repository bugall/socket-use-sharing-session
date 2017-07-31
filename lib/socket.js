'use strick';
const sio = require('socket.io');
const uuid = require('uuid/v4');
const _ = require('lodash');
let socketObj = '';

class Socket {
    constructor(http, opts) {
        opts = opts ? opts : {};
        this.io = sio.listen(http);
        this.channelProcessFunctionMap = {};
        this.socketUidMap = {};
        this.serverMessageSocektMap = {};
        this.autoCleanTimespan = opts.autoCleanTimeSpan || 5; // 5 seconds
        this.overtime = opts.overtime || 5; // 5 seconds
        
        this.bind(opts);
        this.io.on('connection', (socket) => {
            if (socket.request.session.user) {
                if (socket.request.session.user.id) {
                    const userId = socket.request.session.user.id;
                    this.socketUidMap[userId] = socket.id;
                }
            }
            socket.on('message', (data) => this.subscribe(socket, data));
            socket.on('disconnect', () => this.clean(socket.id));
        });
    }
    bind(opts) {
        for(let channel in opts) {
            const callback = opts[channel];
            this.channelProcessFunctionMap[channel] = callback;
        }
    }
    push(users, data) { 
        if (users instanceof Array) {
            users.forEach((user) => {
                const socketId = this.socketUidMap[user];
                const socket = this.getSocket(socketId);
                typeof socket === 'object' ? socket.emit('message', data) : '';
            });
        } else {
            throw new Error('users must be a array object');
        }
    }
    subscribe(socketId, data) {
        const serverMessageId= uuid();
        const timestamp = Date.parse(new Date());
        data = typeof data === 'string' ? JSON.parse(data) : data;
        const channel = data.channel;

        this.serverMessageSocektMap[serverMessageId] = { 
            serverMessageId: serverMessageId, 
            socketId: socketId, 
            channel: channel,
            clientMessageId: data.clientMessageId,
            timestamp:  timestamp
        };
        
        data.serverMessageId= serverMessageId;

        this.channelProcessFunctionMap[channel](data).then((result) => {
            if (!_.isEmpty(this.serverMessageSocektMap[result.serverMessageId])) {
                const { socketId, channel, clientMessageId } = this.serverMessageSocektMap[result.serverMessageId];
                result.channel = channel;
                result.clientMessageId = clientMessageId;
                result.type = typeof result === 'string' ? 'string' : 'object';
                
                const socket = this.getSocket(socketId);
                typeof socket === 'object' ? socket.emit('message', result) : '';

                // remove
                delete this.serverMessageSocektMap[result.serverMessageId];
            }
        }).catch((err) => {
            console.log(err.stack);
        });
    }
    getSocket(socketId) {
        let socket = this.io.sockets.connected[socketId];
        if (typeof socket !== 'object') {
            socket = '';
        }
        return socket;
    }
    clean(socketId) {
        // socketUserMap
        for (let userId in this.socketUidMap) {
            if (this.socketUidMap[userId] === socketId) {
                delete this.socketUidMap[userId];
                break;
            }
        }
    }
    cleanupTimeoutRequest() {
        Object.keys(this.serverMessageSocektMap).forEach((serverMessageId) => {
            const now = Date.parse(new Date());
            if (this.serverMessageSocektMap[serverMessageId].timestamp - now < 5000) {
                delete this.serverMessageSocektMap[serverMessageId];
            }
        });
    }
    use(sessionMiddleware) {
        this.io.use(sessionMiddleware);
    }
}
module.exports = (http, opts) => {
    if (!socketObj) {
        socketObj = new Socket(http, opts);
    }
    return socketObj;
};
