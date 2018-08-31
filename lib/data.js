/*
 * Library for storing and editing data
 *
 */

// Dependencies
var fs = require('fs');
var path = require('path');
const helpers = require('./helpers');

// Container for module (to be exported)
var lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = (dir, file, data, callback) => {

    const filename = file + '.json';
    const filePath = path.join(lib.baseDir, dir, filename);

    // Open the file for writing
    fs.open(filePath, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Convert data to string
            var stringData = JSON.stringify(data);

            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    });
                } else {
                    callback('Error writing to new file');
                }
            });
        } else {
            callback('Could not create new file, it may already exist');
        }
    });
};

// Read data from a file
lib.read = (dir, file, callback) => {
    const filename = file + '.json';
    const filePath = path.join(lib.baseDir, dir, filename);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (!err && data) {
            var parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};

// Update data in a file
lib.update = (dir, file, data, callback) => {

    const filename = file + '.json';
    const filePath = path.join(lib.baseDir, dir, filename);
    // Open the file for writing
    fs.open(filePath, 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // Convert data to string
            var stringData = JSON.stringify(data);

            // Truncate the file
            fs.truncate(fileDescriptor, (err) => {
                if (!err) {
                    // Write to file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing existing file');
                                }
                            });
                        } else {
                            callback('Error writing to existing file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback('Could not open file for updating, it may not exist yet');
        }
    });

};

// Delete a file
lib.delete = (dir, file, callback) => {
    const filename = file + '.json';
    const filePath = path.join(lib.baseDir, dir, filename);

    // Unlink the file from the filesystem
    fs.unlink(filePath, (err) => {
        callback(err);
    });

};

// List all the items in a directory
lib.list = (dir, callback) => {

    const filePath = path.join(lib.baseDir, dir);
    fs.readdir(filePath, (err, data) => {
        if (!err && data && data.length > 0) {
            const trimmedFileNames = data.map(filename => filename.replace('.json', ''));
            callback(false, trimmedFileNames);
        } else {
            callback(err, data);
        }
    });
};

// Export the module
module.exports = lib;