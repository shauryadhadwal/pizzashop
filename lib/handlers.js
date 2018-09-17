/*
 * Request Handlers
 */

//  Dependencies

const config = require('../lib/config');

//  Import all public routes
const index = require('../routes/index');
const account = require('../routes/account');
const session = require('../routes/session');
const dashboard = require('../routes/dashboard');
const favicon = require('../routes/favicon');
const public = require('../routes/public');

// Import all API routes
const users = require('../routes/api/users');
const orders = require('../routes/api/orders');
const tokens = require('../routes/api/tokens');
const items = require('../routes/api/items');
const cart = require('../routes/api/cart');

// Define all the handlers
const handlers = {};

// Public
handlers.index = index;
handlers.accountCreate = account.create;
handlers.accountDelete = account.delete;
handlers.accountEdit = account.edit;
handlers.sessionCreate = session.create;
handlers.sessionDelete = session.delete;
handlers.dashboard = dashboard.dashboard;
handlers.showCartItems = dashboard.showCartItems;
handlers.favicon = favicon;
handlers.public = public;

// API
handlers.users = users.route;
handlers.orders = orders.route;
handlers.tokens = tokens.route;
handlers.items = items.route;
handlers.cart = cart.route;


// NOT FOUND
handlers.notFound = (data, callback) => {
    callback(404, 'Path Error. Redirect to <a href="' + config.templateGlobals.baseUrl + '">Pizza Palace</a>', 'html');
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