const $ = require('jquery');
const uuid = require('uuid/v4');

socket.on('message', (message) => {
    console.log(message);
    alert(JSON.stringify(message));
})
$('.getUserInfo').on('click', () => {
    console.log('send message');
    socket.emit('getUserInfo', {
        requestId: uuid(),
        userId: 10000
    });
});

$('.searchRoutes').on('click', () => {
    console.log('send message');
    socket.emit('searchRoutes', {
        requestId: uuid(),
        orderId: 10000
    });
});