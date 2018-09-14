/**
 * Items
 * 
 * 
 * 
 */

// Dependencies
const _data = require('../../lib/data');
const _tokens = require('./tokens');
const validity = require('../../lib/validation');

const routingControl = (data, callback) => {
    const acceptedMethods = ['get'];
    if (acceptedMethods.indexOf(data.method) > -1) {
        _items[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the users methods
_items = {};

// Get all items on the site
_items.get = (data, callback) => {
    // Sanity check
    const phone = validity.phone(data.headers.phone);
    if (phone) {
        // Get token from headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        // Verify token validity
        _tokens.internal.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('items', 'items', (err, data) => {
                    if (!err && data) {
                        callback(200, data);
                    } else {
                        callback(404, {error: 'No items available'});
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

module.exports = {route: routingControl};