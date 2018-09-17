const helpers = require('../lib/helpers');

const dashboard = {};

dashboard.dashboard = (data, callback) => {
    if (data.method == 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Dashboard',
            'head.description': 'Dashboard',
            'body.class': 'dashboard'
        };
        // Read in a template as a string
        helpers.getTemplate('dashboard', templateData, (err, str) => {
            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, (err, str) => {
                    if (!err && str) {
                        // Return that page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
}

dashboard.showCartItems = (data, callback) => {
    if (data.method == 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Cart',
            'head.description': 'Items in your cart',
            'body.class': 'cart'
        };
        // Read in a template as a string
        helpers.getTemplate('cartItems', templateData, (err, str) => {
            if (!err && str) {
                // Add the universal header and footer
                helpers.addUniversalTemplates(str, templateData, (err, str) => {
                    if (!err && str) {
                        // Return that page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

module.exports = dashboard;