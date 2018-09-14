const helpers = require('../lib/helpers');

const dashboard = (data, callback) => {
    if (data.method == 'get') {
        // Prepare data for interpolation
        var templateData = {
            'head.title': 'Dashboard',
            'head.description': 'Dashboard',
            'body.class': 'index'
        };
        // Read in a template as a string
        helpers.getTemplate('index', templateData, (err, str) => {
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

module.exports = dashboard;