// dependency
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');

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

handler._users.get = (requestProperties, callback) => {
    callback(200);
};
handler._users.put = (requestProperties, callback) => {};
handler._users.delete = (requestProperties, callback) => {};

module.exports = handler;
