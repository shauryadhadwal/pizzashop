/*
 * CLI-related tasks
 *
 */

// Dependencies
var readline = require('readline');
var util = require('util');
var debug = util.debuglog('cli');
var events = require('events');
class _events extends events {};
var e = new _events();
var _data = require('./data');

// Instantiate the cli module object
var cli = {};

// Event Handlers
e.on('exit', function () {
    process.exit(0);
});

e.on('help', function (str) {
    cli.responders.help();
});

e.on('items', function (str) {
    cli.responders.items();
});

e.on('orders', function (str) {
    cli.responders.orders(str);
});

e.on('users', function (str) {
    cli.responders.users(str);
});

// Responder Objects
cli.responders = {};

cli.responders.exit = function () {
    process.exit(0);
}

cli.responders.help = function () {
    const commands = {
        'exit': 'Kill the Application',
        'help': 'Show this help page',
        'items': 'Show list of items available',
        'orders': 'Show all orders placed',
        'orders --recent': 'Show list of all items placed in the last 24 hours',
        'orders --id {orderid}': 'Display order having orderid',
        'users': 'Show all users in the system',
        'users --recent': 'Show all users who have signed up in the last 24 hours',
        'users --id {userid}': 'Display user with userid'
    }

    cli.format.horizontalLine();
    cli.format.centered('Pizza Place Manual');
    cli.format.horizontalLine();
    cli.format.verticalSpace(2);

    // Print commands
    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
            const value = commands[key];
            let line = '\x1b[35m' + key + '\x1b[0m';
            const padding = 40 - line.length;
            for (let index = 0; index < padding; index++) {
                line += ' ';
            }
            line += commands[key]
            console.log(line);
            cli.format.verticalSpace(1);
        }
    }

    cli.format.verticalSpace(1);
    cli.format.horizontalLine(1);

}

cli.responders.items = function (str) {
    _data.read('items', 'items', function (error, data) {
        if (!error && data) {
            cli.format.verticalSpace();
            data.list.forEach(ele => {
                console.log('[Id] ' + ele.id + ' [Name] ' + ele.name + ' [Cost] ' + ele.cost);
                cli.format.verticalSpace();
            });
        } else {
            console.log('No items to display');
        }
    });
}

cli.responders.orders = function (str) {
    const array = str.split('--');

    array.forEach(ele => {
        if (ele === 'orders' && array.length == 1) {
            // List all orders in directory
            _data.list('orders', function (error, list) {
                if (!error && list && list.length > 0) {
                    // Iterate over orders list
                    list.forEach(orderId => {
                        // Get data of order
                        _data.read('orders', orderId, function (error, returnedOrderObject) {
                            // if data is valid
                            if (!error && returnedOrderObject) {
                                // Set yesterday's date
                                console.dir(returnedOrderObject, {
                                    colors: 'true'
                                });
                                cli.format.verticalSpace();
                            } else {
                                console.log('Corrupted file ' + orderId);
                            }
                        });
                    });
                } else {
                    console.log('No orders at all!');
                }
            });
        }

        if (ele.indexOf('recent') > -1) {
            // List all orders in directory
            _data.list('orders', function (error, list) {
                if (!error && list && list.length > 0) {
                    let count = 0;
                    // Iterate over orders list
                    list.forEach(orderId => {
                        // Get data of order
                        _data.read('orders', orderId, function (error, returnedOrderObject) {
                            // if data is valid
                            if (!error && returnedOrderObject) {
                                // Set yesterday's date
                                const recent = new Date();
                                recent.setDate(recent.getDate() - 10);

                                // Get order date
                                const dateOfOrder = new Date(returnedOrderObject.date);

                                // Validate dates
                                if (dateOfOrder >= recent) {
                                    console.dir(returnedOrderObject, {
                                        colors: 'true'
                                    });
                                    cli.format.verticalSpace();
                                    count++;
                                }

                            } else {
                                console.log('Corrupted file ' + orderId);
                            }
                        });
                    });
                    if (count == 0) {
                        console.log('No recent orders');
                    }
                } else {
                    console.log('No orders at all!');
                }
            });
        }

        if (ele.indexOf('id') > -1) {
            const array = ele.split(' ');
            const id = typeof (array) == 'object' && array.length == 2 && typeof (array[1]) == 'string' ? array[1] : false;
            if (id) {
                _data.read('orders', id, (error, returnedOrderObject) => {
                    if (!error && returnedOrderObject) {
                        console.dir(returnedOrderObject, {
                            colors: true
                        });
                    } else {
                        console.log('No such order exists' + id);
                    }
                })
            } else {
                console.log('Not a valid id');
                cli.format.verticalSpace();
            }
        }
    });
}

cli.responders.users = function (str) {
    const array = str.split('--');

    array.forEach(ele => {

        // Input: users
        if (ele === 'users' && array.length == 1) {
            _data.list('users', function (error, list) {
                if (!error && list && list.length > 0) {
                    // Iterate over users list
                    list.forEach(userId => {
                        // Get data of user
                        _data.read('users', userId, function (error, returnedUserObject) {
                            // if data is valid
                            if (!error && returnedUserObject) {
                                returnedUserObject.password = null;
                                console.dir(returnedUserObject, {
                                    colors: 'true'
                                });
                                cli.format.verticalSpace();
                            } else {
                                console.log('Corrupted file ' + orderId);
                            }
                        });
                    });
                } else {
                    console.log('No users at all!');
                }
            });
        }

        // Input: users --recent
        if (ele.indexOf('recent') > -1) {
            // List all orders in directory
            _data.list('users', function (error, list) {
                if (!error && list && list.length > 0) {
                    let count = 0;
                    // Iterate over users list
                    list.forEach(userId => {
                        // Get data of user
                        _data.read('users', userId, function (error, returnedUserObject) {
                            // if data is valid
                            if (!error && returnedUserObject) {
                                // Set yesterday's date
                                const recent = new Date();
                                recent.setDate(recent.getDate() - 10);

                                const dateOfSignUp = new Date(returnedUserObject.signupDate);

                                // Validate dates
                                if (dateOfSignUp >= recent) {
                                    returnedUserObject.password = null;
                                    console.dir(returnedUserObject, {
                                        colors: 'true'
                                    });
                                    cli.format.verticalSpace();
                                    count++;
                                }
                            } else {
                                console.log('Corrupted file ' + userId);
                            }
                        });
                    });
                    if (count == 0) {
                        console.log('No recent joinees');
                    }
                } else {
                    console.log('No users at all!');
                }
            });
        }

        // Input: users --email {emailid}
        if (ele.indexOf('email') > -1) {
            const array = ele.split(' ');
            const email = typeof (array) == 'object' && array.length == 2 && typeof (array[1]) == 'string' ? array[1] : false;
            if (email) {
                _data.list('users', function (error, list) {
                    if (!error && list && list.length > 0) {
                        let count = 0;
                        // Iterate over users list
                        list.forEach(userId => {
                            // Get data of user
                            _data.read('users', userId, function (error, returnedUserObject) {
                                // if data is valid
                                if (!error && returnedUserObject) {
                                    if (returnedUserObject.emailid === email) {
                                        count++;
                                        returnedUserObject.password = null;
                                        console.dir(returnedUserObject, {
                                            colors: 'true'
                                        });
                                        cli.format.verticalSpace();

                                    }
                                } else {
                                    console.log('Corrupted file ' + userId);
                                }
                            });
                        });
                        if (count == 0) {
                            console.log('No user found with email id: ' + email);
                        }
                    } else {

                    }
                });
            } else {
                console.log('Not a valid id');
                cli.format.verticalSpace();
            }
        }
    });
}

// CLI formatters
cli.format = {};

cli.format.horizontalLine = function () {
    const width = process.stdout.columns;

    let line = '';
    for (let index = 0; index < width; index++) {
        line += '-';
    }
    console.log(line);
}

cli.format.centered = function (str) {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : '';

    const width = process.stdout.columns;
    const padding = Math.floor((width - str.length) / 2);
    let line = '';
    for (let index = 0; index < padding; index++) {
        line += ' ';
    }
    line += str;
    console.log(line);
}

cli.format.verticalSpace = function (lines) {
    lines = typeof (lines) == 'number' && lines > 0 ? lines : 1;
    for (let index = 0; index < lines; index++) {
        console.log('');
    }
}


// Input processor
cli.processInput = function (str) {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false;
    // Only process the input if the user actually wrote something, otherwise ignore it
    if (str) {
        // Codify the unique strings that identify the different unique questions allowed be the asked
        var uniqueInputs = [
            'exit',
            'help',
            'items',
            'orders',
            'users'
        ];

        // Go through the possible inputs, emit event when a match is found
        var matchFound = false;
        var counter = 0;
        uniqueInputs.some(function (input) {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;
                e.emit(input, str);
                return true;
            }
        });

        if (!matchFound) {
            console.log("Sorry, try again");
        }

    }
};

// Init script
cli.init = function () {

    // Send to console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

    // Start the interface
    var _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '{S} '
    });

    _interface.prompt();

    _interface.on('line', function (str) {
        cli.processInput(str);

        _interface.prompt();
    });

    _interface.on('close', function () {
        process.exit(0);
    });

};


// Export the module
module.exports = cli;