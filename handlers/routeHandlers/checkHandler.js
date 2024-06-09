// dependency
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// Module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    // validate inputs
    let { protocol, url, method, successCodes, timeoutSeconds } = requestProperties.body;

    protocol =        typeof protocol === 'string' && ['http', 'https'].includes(protocol) ? protocol : false;
    url = typeof url === 'string' && url.trim().length > 0 ? protocol : false;
    method =        typeof method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].includes(method)
            ? method
            : false;
    successCodes =        typeof successCodes === 'object' && successCodes instanceof Array ? successCodes : false;
    // eslint-disable-next-line prettier/prettier
    timeoutSeconds = typeof timeoutSeconds === 'number' && timeoutSeconds % 1 === 0 && timeoutSeconds >= 1 && timeoutSeconds <= 5 ? timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // eslint-disable-next-line prettier/prettier
        const token = typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        // lookup the user phone by reading the token
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJSON(tokenData).phone;
                // lookup the user data
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = parseJSON(userData);
                                // eslint-disable-next-line prettier/prettier
                                const userChecks = typeof userObject.checks === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    // save the object
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            // add check id to the users object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // save the new user data
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    // return the data about the new check
                                                    callback(200, {
                                                        checkObject,
                                                    });
                                                } else {
                                                    callback(500, {
                                                        error: 'There was an error on the server side',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was an error on the server side',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'Users has already reached max check limit',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication problem',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'User not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication problem',
                });
            }
        });
    } else {
        callback(400, {
            error: 'you have a problem in your request',
        });
    }
};

handler._check.get = (requestProperties, callback) => {
    let { id } = requestProperties.queryStringObject;
    id = typeof id === 'string' && id.trim().length === 20 ? id : false;

    if (id) {
        // lookup the check
        data.read('checks', id, (err, checkData) => {
            if ((!err, checkData)) {
                // eslint-disable-next-line prettier/prettier
                const token = typeof requestProperties.headersObject.token === 'string'
                        ? requestProperties.headersObject.token
                        : false;

                tokenHandler._token.verify(
                    token,
                    parseJSON(checkData).userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            callback(200, parseJSON(checkData));
                        } else {
                            callback(403, {
                                error: 'Authentication failure',
                            });
                        }
                    },
                );
            } else {
                callback(500, {
                    error: 'you have a problem in your request',
                });
            }
        });
    } else {
        callback(400, {
            error: 'you have a problem in your request',
        });
    }
};

handler._check.put = (requestProperties, callback) => {
    // validate inputs
    let { protocol, url, method, successCodes, timeoutSeconds, id } = requestProperties.body;

    protocol =        typeof protocol === 'string' && ['http', 'https'].includes(protocol) ? protocol : false;
    url = typeof url === 'string' && url.trim().length > 0 ? protocol : false;
    method =        typeof method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].includes(method)
            ? method
            : false;
    successCodes =        typeof successCodes === 'object' && successCodes instanceof Array ? successCodes : false;
    // eslint-disable-next-line prettier/prettier
    timeoutSeconds = typeof timeoutSeconds === 'number' && timeoutSeconds % 1 === 0 && timeoutSeconds >= 1 && timeoutSeconds <= 5 ? timeoutSeconds : false;

    id = typeof id === 'string' && id.trim().length === 20 ? id : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if (!err1 && checkData) {
                    const checkObject = parseJSON(checkData);
                    // eslint-disable-next-line prettier/prettier
                    const token = typeof requestProperties.headersObject.token === 'string'
                            ? requestProperties.headersObject.token
                            : false;

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }
                            // store the check object
                            data.update('checks', id, checkObject, (err2) => {
                                if (!err2) {
                                    callback(200);
                                } else {
                                    callback(500, { error: 'There was a server side error' });
                                }
                            });
                        } else {
                            callback(403, { error: 'Authentication problem' });
                        }
                    });
                } else {
                    callback(500, { error: 'There was a problem in the server' });
                }
            });
        } else {
            callback(400, { error: 'You must provide at least one field to update' });
        }
    } else {
        callback(400, { error: 'You have a problem in your request' });
    }
};

handler._check.delete = (requestProperties, callback) => {};

module.exports = handler;
