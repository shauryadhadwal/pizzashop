/**
 * Dependencies
 * 
 */

const config = require('./config');
const path = require('path');
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const util = require('util');
const debug = util.debuglog('server');

// Server Object
const server = {};

/**
 * HTTP SERVER
 */
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

/**
 * HTTPS Server 
 */
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '..', 'https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '..', 'https/cert.pem'))
};

server.httpsServer = https.createServer((req, res) => {
    server.unifiedServer(req, res);
});

// Handle request and response logic
server.unifiedServer = (req, res) => {

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const queryStringObject = parsedUrl.query;
    const method = req.method.toLowerCase();
    const headers = req.headers;

    //Extract payload if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', data => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        // Get route from defined routes and redirect to corresponding handler
        let chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // If the request is within the public directory, go to the public handler instead
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

        // Prepare data object to send to the handler
        const data = {
            path: trimmedPath,
            method: method,
            payload: helpers.parseJsonToObject(buffer),
            query: queryStringObject,
            headers: headers
        }

        // Route request to handler
        chosenHandler(data, (statusCode, payload, contentType) => {

            // Check content type json
            contentType = typeof (contentType) == 'string' ? contentType : 'json';

            // Default status code 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            let payloadString = '';

            if (contentType == 'json') {
                res.setHeader('Content-Type', 'application/json');
                payload = typeof (payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
            } else if (contentType == 'html') {
                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof (payload) == 'string' ? payload : '';
            } else if (contentType == 'favicon') {
                res.setHeader('Content-Type', 'image/x-icon');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            } else if (contentType == 'plain') {
                res.setHeader('Content-Type', 'text/plain');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            } else if (contentType == 'css') {
                res.setHeader('Content-Type', 'text/css');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            } else if (contentType == 'png') {
                res.setHeader('Content-Type', 'image/png');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            } else if (contentType == 'jpg') {
                res.setHeader('Content-Type', 'image/jpeg');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            }

            res.writeHead(statusCode);
            res.end(payloadString);

            // If the response is 200, print green, otherwise print red
            if (statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            } else {
                debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            }
        });
    });
};

// Define Router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/delete': handlers.accountDelete,
    'session/create': handlers.sessionCreate,
    'session/delete': handlers.sessionDelete,
    'dashboard': handlers.dashboard,
    'dashboard/cart': handlers.showCartItems,
    'public': handlers.public,
    'favicon.ico': handlers.favicon,
    'api/users': handlers.users,
    'api/orders': handlers.orders,
    'api/tokens': handlers.tokens,
    'api/items': handlers.items,
    'api/cart': handlers.cart,
}

// Function to start server and other processes
server.init = () => {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[36m%s\x1b[0m', 'The HTTP server is running on port ' + config.httpPort);
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[35m%s\x1b[0m', 'The HTTPS server is running on port ' + config.httpsPort);
    });
};

module.exports = server;