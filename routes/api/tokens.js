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
const validity = require('../../lib/validation');

routingControl = (data, callback) => {
    const acceptedMethods = ['get', 'put', 'post', 'delete'];

    // Check if method exists on route
    if (acceptedMethods.indexOf(data.method) > -1) {
        _tokens[data.method](data, callback);
    } else {
        calback(405);
    }
};

// Container for all the users methods
_tokens = {};

_tokens.post = (data, callback) => {
    // Sanity check
    const phone = validity.phone(data.payload.phone);
    const password = validity.password(data.payload.password);

    if (phone && password) {

        // Lookup the user with the matching credentials
        _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                const hashedPassword = helpers.hash(password);
                if (hashedPassword === userData.password) {

                    // Total length 20 Characters
                    const tokenId = (helpers.createRandomString(8) + Date.now()).substring(0, 20);

                    // Expires in 1 hour
                    const expires = Date.now() + (1000 * 60 * 60 * 5);

                    const tokenObject = {
                        phone: phone,
                        id: tokenId,
                        expires: expires
                    }

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, err => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {
                                error: 'Error creating token'
                            })
                        }
                    });
                } else {
                    callback(400, {
                        error: 'Passwords do not match'
                    });
                }
            } else {
                callback(400, {
                    error: 'User does not exist'
                });
            }
        });
    } else {
        callback(400, {
            error: 'Missing Required Fields'
        })
    }
};

_tokens.put = (data, callback) => {
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if (id && extend) {
        // Lookup the existing token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check to make sure the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    // Store the new updates
                    _data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                error: 'Could not update the token\'s expiration.'
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: "The token has already expired, and cannot be extended."
                    });
                }
            } else {
                callback(400, {
                    error: 'Specified user does not exist.'
                });
            }
        });
    } else {
        callback(400, {
            error: "Missing required field(s) or field(s) are invalid."
        });
    }
}

_tokens.get = (data, callback) => {
    // Check that id is valid
    const id = typeof (data.query.id) == 'string' && data.query.id.trim().length === 20 ? data.query.id.trim() : false;

    if (id) {
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {
            error: 'Missing required field, or field invalid'
        })
    }
};

_tokens.delete = (data, callback) => {

    // Check that id is valid
    const id = typeof (data.query.id) == 'string' && data.query.id.trim().length == 20 ? data.query.id.trim() : false;
    if (id) {
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Delete the token
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: 'Could not delete the specified token'
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Could not find the specified token.'
                });
            }
        });
    } else {
        callback(400, {
            error: 'Missing required field'
        })
    }
}

// Non Public Method 
// Verify Token Validity
_tokens.verifyToken = (id, phone, callback) => {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = {
    route: routingControl,
    internal: {
        verifyToken: _tokens.verifyToken
    }
};