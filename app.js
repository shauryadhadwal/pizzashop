/*
*   Entry file into this project
*/

// Dependecies
const server = require('./lib/server');
const worker = require('./lib/worker');
const config = require('./lib/config');
const cli = require('./lib/cli');

// Declare the app
const app = {};

// Initialization function
app.init = () => {
    server.init();
    worker.init();
    setTimeout(() => {
        cli.init();
    }, 100);
}

app.init();

module.exports = app;

