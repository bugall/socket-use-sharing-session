const $ = require('jquery');
const uuid = require('uuid/v4');

socket.on('message', (message) => {
    console.log(message);
    alert(JSON.stringify(message));
})
$('.getUserInfo').on('click', () => {
    console.log('send message');
    socket.emit('message', {
        channel:'getUserInfo',
        clientMessageId: uuid(),
        userId: 10000
    });
});

$('.searchRoutes').on('click', () => {
    console.log('send message');
    socket.emit('message', {
        channel:'searchRoutes',
        clientMessageId: uuid(),
        orderId: 10000
    });
});