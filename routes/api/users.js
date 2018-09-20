/**
 * USERS
 * 
 * First Name, Last Name, Phone, Address, EmailId, Password
 * 
 */

// Dependencies
const helpers = require('../../lib/helpers');
const config = require('../../lib/config');
const _data = require('../../lib/data');
const _tokens = require('./tokens');
const validity = require('../../lib/validation');

routingControl = (data, callback) => {
    const acceptedMethods = ['get', 'put', 'post', 'delete'];
    if (acceptedMethods.indexOf(data.method) > -1) {
        _users[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the users methods
_users = {};

_users.post = (data, callback) => {
    // Sanity check
    const firstName = validity.firstName(data.payload.firstName);
    const lastName = validity.lastName(data.payload.lastName);
    const address = validity.address(data.payload.address);
    const emailid = validity.email(data.payload.emailid);
    const password = validity.password(data.payload.password);
    const phone = validity.phone(data.payload.phone);

    if (firstName && lastName && phone && address && emailid && password) {
        // Check if user already exists
        _data.read('users', phone, (err, data) => {
            if (err) {
                // Hash password before saving
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    const userObject = {
                        firstName: firstName,
                        lastName: lastName,
                        address: address,
                        phone: phone,
                        emailid: emailid,
                        password: hashedPassword,
                        cart: [],
                        orders: [],
                        signupDate: Date.now()
                    }

                    // Store the user
                    _data.create('users', phone, userObject, err => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {
                                error: 'New user could not be created.'
                            })
                        }
                    });
                } else {
                    callback(500, {
                        error: 'Could not hash the user\'s password.'
                    });
                }
            } else {
                callback(400, {
                    error: 'A user with this phone number already exists'
                });
            }
        });
    } else {
        callback(400, {
            error: 'Missing Required Fields'
        })
    }
};

_users.get = (data, callback) => {

    // Check if phone number is valid
    const phone = validity.phone(data.headers.phone);
    
    if (phone) {
        const token = validity.token(data.headers.token);
        // Verify token validity
        _tokens.internal.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        // Remove the hashed password from the user user object before returning it to the requester
                        delete data.password;
                        callback(200, data);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(403, {
                    error: "Missing required token in header, or token is invalid."
                })
            }
        });

    } else {
        callback(400, {
            error: 'Missing required field'
        })
    }
};

_users.put = (data, callback) => {
    // Sanity check
    const firstName = validity.firstName(data.payload.firstName);
    const lastName = validity.lastName(data.payload.lastName);
    const address = validity.address(data.payload.address);
    const emailid = validity.email(data.payload.emailid);
    const password = validity.password(data.payload.password);
    const phone = validity.phone(data.payload.phone);
    const token = validity.token(data.headers.token);
    
    // Check if phone number is valid
    if (phone) {
        // Error if nothing is sent to update
        if (firstName || lastName || password || emailid || address) {

            // Verify that the given token is valid for the phone number
            _tokens.internal.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {

                    // Lookup the user
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            // Update the fields if necessary
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = helpers.hash(password);
                            }
                            // Store the new updates
                            _data.update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        error: 'Could not update the user.'
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'Specified user does not exist.'
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: "Missing required token in header, or token is invalid."
                    });
                }
            });
        } else {
            callback(400, {
                error: 'Missing fields to update.'
            });
        }
    } else {
        callback(400, {
            error: 'Missing required field.'
        });
    }
};

_users.delete = (data, callback) => {

    const phone = validity.phone(data.headers.phone);
    
    // Check if phone number is valid
    if (phone) {
        const token = validity.token(data.headers.token);
        // Verify that the given token is valid for the phone number
        _tokens.internal.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.delete('users', phone, (err) => {
                    if(!err) {
                        callback(200);
                    }
                    else {
                        callback(500, {error: 'Could not delete'});
                    }
                });
            } else {
                callback(400, {
                    error: 'Token missing or expired'
                })
            }
        });

    } else {
        callback(400, {
            error: 'Missing required field'
        })
    }
}

module.exports = { route: routingControl};