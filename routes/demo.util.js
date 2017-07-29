'use strick';
const searchUser = (opts) => {
    return new Promise((resolve, reject) => {
        // db.find({_id: opts.data.userId})
        resolve({
            replyId: opts.replyId,
            requestId: opts.requestId,
            data: {
                userInfo: {
                    _id: '5697915cc882688701d6d563',
                    name: 'bugall'
                }
            }
        });
    });
};

const getRoutesInfo = (opts) => {
    return new Promise((resolve, reject) => {
        // db.routes({_id: opts.data.userId})
        resolve({
            replyId: opts.replyId,
            requestId: opts.requestId,
            data: {
                _id: '5697915cc882688701d6d563',
                item: [{
                    time: '2017-07-30',
                    city: 'Shang Hai',
                }]
            }
        });
    });
};
module.exports = { searchUser, getRoutesInfo };