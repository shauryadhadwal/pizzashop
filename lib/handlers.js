/*
 * Request Handlers
 */

// Routes
const users = require('../routes/users');
const orders = require('../routes/orders');
const tokens = require('../routes/tokens');
const items = require('../routes/items');
const cart = require('../routes/cart');

// Define all the handlers
const handlers = {};

handlers.users = users.route;
handlers.orders = orders.route;
handlers.tokens = tokens.route;
handlers.items = items.route;
handlers.cart = cart.route;

// NOT FOUND
handlers.notFound = (data, callback) => {
    callback(404, {
        message: 'Bad URL'
    });
};

// Verify token before routing request
handlers.badToken = (data, callback) => {
    callback(404, {
        message: 'Token expired or does not exist'
    });
}

handlers.badRequest = (data, callback) => {
    callback(404, {
        message: 'UserId not provided or token is missing'
    });  
};

module.exports = handlers;