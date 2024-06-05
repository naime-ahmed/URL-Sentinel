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
    let { id, password } = requestProperties.body;
    id = typeof id === 'string' && id.trim().length === 11 ? id.trim() : false;
    password = typeof password === 'string' && password.trim().length > 0 ? password.trim() : false;

    if (id && password) {
        data.read('users', id, (err1, userData) => {
            const hashedPassword = hash(password);
            if (hashedPassword === parseJSON(userData).password) {
                const tokenId = createRandomString(20);
                const expires = Date.now() + 60 * 60 * 1000;
                const tokenObject = {
                    id,
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

handler._token.put = (requestProperties, callback) => {
    let { id, extend } = requestProperties.body;
    id = typeof id === 'string' && id.trim().length === 20 ? id.trim() : false;

    extend = !!(typeof extend === 'boolean' && extend === true);

    if (id && extend) {
        data.read('tokens', id, (err1, tokenData) => {
            const tokenObject = parseJSON(tokenData);
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;
                // store the updated token
                data.update('tokens', id, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: 'There was a server side error',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Token already expired',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request',
        });
    }
};

handler._token.delete = (requestProperties, callback) => {
    // check the id number is valid.
    let { id } = requestProperties.queryStringObject;
    id = typeof id === 'string' && id.trim().length === 20 ? id : false;

    if (id) {
        // Lookup the user
        data.read('tokens', id, (err1, tokenData) => {
            if (!err1 && tokenData) {
                data.delete('tokens', id, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'token was successfully delted',
                        });
                    } else {
                        callback(400, {
                            error: 'There was a server side error',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'There was a server side error',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in you request',
        });
    }
};

module.exports = handler;
