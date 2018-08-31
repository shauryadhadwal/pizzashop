// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');

const worker = {}

// Method to Delete expired tokens
worker.tokensCheck = () => {
    // Get list of all tokens in directory
    const tokensList = [];
    _data.list('tokens', (err, fileNames) => {
        if (!err && fileNames.length > 0) {
            fileNames.forEach(name => {
                const contents = _data.read('tokens', name, (err, data) => {
                    if (!err && data) {
                        // Check if expires is less than current time
                        const now = Date.now();
                        if (data.expires < Date.now()) {
                            _data.delete('tokens', name, (err) => {
                                if (!err) {
                                    console.log('Deleted file:  ' + name + '.json');
                                } else {
                                    console.log('Error in deleting file ' + name + '.json');
                                }
                            });
                        }
                    } else {
                        console.log('Error in reading file ' + name + '.json');
                    }
                })
            });
        } else {
            console.log('No token files');
        }
    });
}

// Check tokens for deletion periodically
worker.tokenCheckLoop = () => {
    setInterval(() => {
        worker.tokensCheck();
    }, 1000 * 60 * 10);
}

worker.init = () => {

    console.log('Workers are running');

    worker.tokensCheck();
    worker.tokenCheckLoop();
}

module.exports = worker;
