socket = require("socket.io-client")('http://localhost:3000');
var log = console.info;

socket.on('disconnect', () => {
    log('you have been disconnected');
});

socket.on('reconnect', () => {
    log('you have been reconnected');
});

socket.on('reconnect_error', () => {
    log('attempt to reconnect has failed');
});
require('./demo');