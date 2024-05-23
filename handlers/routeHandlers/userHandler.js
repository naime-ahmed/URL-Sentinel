// dependency
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');

// Module scaffolding
const handler = {};

handler.userHandlers = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    let { firstName, lastName, phone, password, tosAgreement } = requestProperties.body;
    firstName =        typeof firstName === 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
    lastName = typeof lastName === 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
    phone = typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    password = typeof password === 'string' && password.trim().length > 0 ? password.trim() : false;
    tosAgreement =        typeof tosAgreement === 'boolean' && tosAgreement === true ? tosAgreement : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that user already exist or not
        data.read('users', phone, (err1) => {
            if (err1) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                // store the user to db
                data.create('users', phone, userObject, (err2) => {
                    if (!err2) {
                        callback(200, { message: 'User crated successfully' });
                    } else {
                        callback(500, { Error: 'Could not create user' });
                    }
                });
            } else {
                callback(500, { error: 'There was a problem in server side!' });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};
// @TODO Authentication
handler._users.get = (requestProperties, callback) => {
    // check the phone number is valid.
    let { phone } = requestProperties.queryStringObject;
    phone = typeof phone === 'string' && phone.trim().length === 11 ? phone : false;

    if (phone) {
        // Lookup the user
        data.read('users', phone, (err, u) => {
            const user = { ...parseJSON(u) };

            if (!err && user) {
                delete user.password;
                callback(200, user);
            } else {
                callback(404, {
                    error: 'Requested user was not found',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested user was not found',
        });
    }
};
// @TODO Authentication
handler._users.put = (requestProperties, callback) => {
    let { firstName, lastName, phone, password, tosAgreement } = requestProperties.body;
    firstName =        typeof firstName === 'string' && firstName.trim().length > 0 ? firstName.trim() : false;
    lastName = typeof lastName === 'string' && lastName.trim().length > 0 ? lastName.trim() : false;
    phone = typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    password = typeof password === 'string' && password.trim().length > 0 ? password.trim() : false;

    if (phone) {
        if (firstName || lastName || password) {
            // lookup the user
            data.read('users', phone, (err1, uData) => {
                const userData = { ...parseJSON(uData) };
                if (!err1 && userData) {
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.password = hash(password);
                    }
                    // update on database
                    data.update('users', phone, userData, (err2) => {
                        if (!err2) {
                            callback(200, {
                                message: 'User has been updated',
                            });
                        } else {
                            callback(500, {
                                error: 'There was a problem in the sever side',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'You have a problem in your request. Please try again',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You have a problem in your request. Please try again',
            });
        }
    } else {
        callback(400, {
            error: 'Invalid phone number. Please try again',
        });
    }
};
// @TODO Authentication
handler._users.delete = (requestProperties, callback) => {
    // check the phone number is valid.
    let { phone } = requestProperties.queryStringObject;
    phone = typeof phone === 'string' && phone.trim().length === 11 ? phone : false;

    if (phone) {
        // Lookup the user
        data.read('users', phone, (err1, userData) => {
            if (!err1 && userData) {
                data.delete('users', phone, (err2) => {
                    if (!err2) {
                        callback(200, {
                            message: 'user was successfully delted',
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
