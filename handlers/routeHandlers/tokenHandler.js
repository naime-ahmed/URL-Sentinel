// dependency
const data = require('../../lib/data');

// Module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {};
// @TODO Authentication
handler._token.get = (requestProperties, callback) => {};
// @TODO Authentication
handler._token.put = (requestProperties, callback) => {};
// @TODO Authentication
handler._token.delete = (requestProperties, callback) => {};

module.exports = handler;
