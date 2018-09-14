/*
*   Entry file into this project
*/

// Dependecies
const server = require('./lib/server');
const worker = require('./lib/worker');
const config = require('./lib/config');

// Declare the app
const app = {};

// Initialization function
app.init = () => {
    server.init();
    worker.init();
    
    console.log('Environment: ' + config.environment);
}

app.init();

module.exports = app;

