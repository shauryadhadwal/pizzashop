/**
 * Cart
 * 
 */

// Dependencies
const helpers = require('../../lib/helpers');
const _data = require('../../lib/data');
const _tokens = require('./tokens');
const validity = require('../../lib/validation');

const routingControl = (data, callback) => {
    const acceptedMethods = ['get', 'post', 'delete'];
    if (acceptedMethods.indexOf(data.method) > -1) {
        _cart[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the users methods
_cart = {};

// Required: list of items -> [{id: ...,quantity: ...}, {...},{...}]
// Optional: none
_cart.post = (data, callback) => {
    
    // Sanity check
    const phone = validity.phone(data.headers.phone);

    if (phone) {
        const itemsToUpdate = typeof (data.payload.items) == 'object' && data.payload.items.length > 0 ? data.payload.items : false;
        if (itemsToUpdate) {
            const token = validity.token(data.headers.token);
            _tokens.internal.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            // Get prices of all items
                            _data.read('items', 'items', (err, itemsData) => {
                                if (!err && itemsData) {
                                    // Update Prices of all items is req
                                    itemsToUpdate.forEach(item => {
                                        // get price from database
                                        const index = itemsData.list.findIndex(x => x.id == item.id);
                                        // update the price
                                        item.cost = itemsData.list[index].cost;
                                    });

                                    // Update cart items
                                    if (userData.cart.length == 0) {
                                        userData.cart = itemsToUpdate;
                                    } else {
                                        itemsToUpdate.forEach(item => {
                                            const index = userData.cart.findIndex(x => x.id == item.id);
                                            // If item is not present in cart, push 
                                            if (index < 0) {
                                                userData.cart.push(item);
                                            } else {
                                                userData.cart[index].quantity += 1;
                                            }
                                        });
                                    }

                                    // Update the file in database
                                    _data.update('users', phone, userData, (err) => {
                                        if (!err) {
                                            callback(200)
                                        } else {
                                            callback(500, {
                                                error: err
                                            });
                                        }
                                    });
                                } else {
                                    callback(500, {
                                        error: 'Error is fetching prices'
                                    });
                                }
                            });


                        } else {
                            callback(404, {
                                error: 'User does not exist'
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
                error: 'No Items to update'
            });
        }
    } else {
        callback(400, {
            error: 'Missing fields in header.'
        });
    }

};

// Required: none
// Optional: none
_cart.get = (data, callback) => {

    const phone = validity.phone(data.headers.phone);

    // Check if phone number is valid
    if (phone) {
        const token = validity.token(data.headers.token);
        // Verify token validity
        _tokens.internal.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        callback(200, data.cart);
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

// Required : id of item to delete
// Optional: none
_cart.delete = (data, callback) => {
    // Check if phone number is valid

    const phone = validity.phone(data.headers.phone);

    if (phone) {
        const idToDelete = typeof (data.query.id) == 'string' && data.query.id.trim().length > 0 ? data.query.id : false;
        if (idToDelete) {
            const token = validity.token(data.headers.token);
            // Verify that the given token is valid for the phone number
            _tokens.internal.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    _data.read('users', phone, (err, data) => {
                        if (!err && data) {
                            const index = data.cart.findIndex(item => item.id == idToDelete);
                            data.cart.splice(index, 1);
                            // Update the file
                            _data.update('users', phone, data, (err) => {
                                if (!err) {
                                    callback(200)
                                } else {
                                    callback(500, {
                                        error: 'Error in deleting item'
                                    });
                                }
                            });
                        } else {
                            callback(404);
                        }
                    });
                } else {
                    callback(400, {
                        error: 'Token missing or expired'
                    });
                }
            });
        } else {
            callback(400, {
                error: 'Id is missing'
            });
        }
    } else {
        callback(400, {
            error: 'Missing required field'
        });
    }
}

module.exports = {
    route: routingControl
};