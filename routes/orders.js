/**
 * Orders
 * 
 */

// Dependencies
const helpers = require('../lib/helpers');
const _data = require('../lib/data');
const _tokens = require('./tokens');
const validity = require('../lib/validation');

routingControl = (data, callback) => {
    const acceptedMethods = ['get', 'post'];
    if (acceptedMethods.indexOf(data.method) > -1) {
        _orders[data.method](data, callback);
    } else {
        callback(405);
    }
}

// Container for all the users methods
_orders = {};

// Place order
_orders.post = (data, callback) => {
    
    // Sanity check
    const phone = validity.phone(data.headers.phone);
    
    if (phone) {
        const token = validity.token(data.headers.token);
        _tokens.internal.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Create new order id
                const orderId = helpers.createRandomString(5) + Date.now();
                // Get cart items
                _data.read('users', phone, (err, userData) => {
                    if (!err, userData) {
                        if (userData.cart.length == 0) {
                            callback(400, {
                                error: 'Nothing in cart'
                            });
                        } else {
                            let amount = 0;
                            // Calculate total cost of all items in order
                            userData.cart.forEach(item => {
                                amount += parseInt(item.cost, 10);
                            });

                            const orderData = {
                                userId: phone,
                                orderId: orderId,
                                cart: userData.cart,
                                date: Date.now(),
                                amount: amount,
                            }

                            // Make payment request
                            helpers.stripePaymentRequest({
                                amount: amount,
                                currency: 'eur',
                                description: 'Order ' + orderId + ' placed',
                                source: 'token_visa'
                            }, (err) => {
                                if (!err) {
                                    // Send mail via mailgun to customer
                                    let text = '';
                                    userData.cart.forEach(item => {
                                        text += 'item: ' + item.id + ' Qty: ' + item.quantity + ' Amount: ' + item.cost + '\n';
                                    });
                                    text += 'Total: ' + amount + '\n';

                                    helpers.mailgunRequest({
                                        from: 'PIZZA_PLACE',
                                        to: userData.emailid,
                                        subject: 'Order ' + orderId + ' placed',
                                        text: text
                                    }, (err) => {
                                        if (!err) {
                                            // If stripe payment was successful, create order in database
                                            _data.create('orders', orderId, orderData, (err) => {
                                                if (!err) {
                                                    // Push id to user db
                                                    userData.orders.push(orderId);
                                                    // Empty cart after successful purchase
                                                    userData.cart = [];
                                                    _data.update('users', phone, userData, (err) => {
                                                        if (!err) {
                                                            callback(200, 'Order Place successfully');
                                                        } else {
                                                            callback(500, 'Error in updating details');
                                                        }
                                                    });
                                                } else {
                                                    callback(500, 'Error in saving details');
                                                }
                                            });
                                        } else {
                                            callback(500, err)
                                        }
                                    });
                                } else {
                                    callback(500, {
                                        error: 'Stripe Payment Failed'
                                    });
                                }
                            });
                        }
                    } else {
                        callback(500, {
                            error: 'Order could not be placed'
                        });
                    }
                });
            } else {
                callback(403, {
                    error: "Missing required token in header, or token is invalid."
                });
            }
        });
        // Check if user already exists
        _data.read('users', phone, (err, data) => {});
    } else {
        callback(400, {
            error: 'Missing fields in header.'
        });
    }

};

// Get order by order Id
_orders.get = (data, callback) => {

    const phone = validity.phone(data.headers.phone);

    if (phone) {
        const token = validity.token(data.headers.token);
        // Verify token validity
        _tokens._verifyToken(token, phone, (tokenIsValid) => {
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

module.exports = {
    route: routingControl
};