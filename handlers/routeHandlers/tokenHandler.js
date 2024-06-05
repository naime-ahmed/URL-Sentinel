// dependency
const data = require('../../lib/data');
const { hash, createRandomString } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');

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

handler._token.post = (requestProperties, callback) => {
    let { phone, password } = requestProperties.body;
    phone = typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    password = typeof password === 'string' && password.trim().length > 0 ? password.trim() : false;

    if (phone && password) {
        data.read('users', phone, (err1, userData) => {
            const hashedPassword = hash(password);
            if (hashedPassword === parseJSON(userData).password) {
                const tokenId = createRandomString(20);
                const expires = Date.now() + 60 * 60 * 1000;
                const tokenObject = {
                    phone,
                    id: tokenId,
                    expires,
                };

                // store the token
                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: 'there was a problem in the server side',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'password is not correct',
                });
            }
        });
    } else {
        callback(400, {
            error: 'you have a problem in your request',
        });
    }
};

handler._token.get = (requestProperties, callback) => {
    // / check the id is valid.
    let { id } = requestProperties.queryStringObject;
    id = typeof id === 'string' && id.trim().length === 20 ? id : false;

    if (id) {
        // Lookup the token
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };

            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Requested token was not found',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested token was not found',
        });
    }
};
// @TODO Authentication
handler._token.put = (requestProperties, callback) => {};
// @TODO Authentication
handler._token.delete = (requestProperties, callback) => {};

module.exports = handler;
