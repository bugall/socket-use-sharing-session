var socket = require("socket.io-client")('http://localhost:3000');
var log = console.info;

socket.on('disconnect', function () {
    log('you have been disconnected');
});

socket.on('reconnect', function () {
    log('you have been reconnected');
});

socket.on('reconnect_error', function () {
    log('attempt to reconnect has failed');
});
