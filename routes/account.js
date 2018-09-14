const helpers = require('../lib/helpers');

const account = {};

account.create = (data, callback) => {
    if (data.method == 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Create an Account',
            'head.description': 'Sign up is easy',
            'body.class': 'accountCreate'
        };
        // Read in a template as a string
        helpers.getTemplate('accountCreate', templateData, (err, str) => {
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

account.edit = (data, callback) => {
    if (data.method == 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Edit Your Account',
            'head.description': 'Account Settings',
            'body.class': 'accountEdit'
        };
        // Read in a template as a string
        helpers.getTemplate('accountEdit', templateData, (err, str) => {
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

account.delete = (data, callback) => {
    if (data.method == 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Account Deleted',
            'head.description': 'Your Account has been deleted',
            'body.class': 'accountDelete'
        };
        // Read in a template as a string
        helpers.getTemplate('accountDelete', templateData, (err, str) => {
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

module.exports = account;