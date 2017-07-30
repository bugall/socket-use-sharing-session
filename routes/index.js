var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    req.session.user = {
        userId: 10000,
        name: 'bugall'
    };
    res.render('index', { title: 'socket.io' });
});

module.exports = router;
