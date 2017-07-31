var express = require('express');
var router = express.Router();
var io = require('../lib/socket')();

/* GET home page. */
router.get('/', function(req, res) {
    req.session.user = {
        id: 10000,
        name: 'bugall'
    };
    setTimeout(() => {io.push([10000], { username: 'bugall', age: 23 })}, 2000);
    res.render('index', { title: 'socket.io' });
});

module.exports = router;
