/**
 * The RedMud Importer.
 * 
 * @namespace Importer
 * @param {object} lib A RedMUDLib object.
 * @returns A RedMUDImporter.
 */
function RedMUDImporter(lib) {

    /**
     * Import data into the Redis server from an object.
     * 
     * @namespace Importer
     * @param {object} data The data to import.
     * @return {Promise} A promise that resolved to true, or rejects with an error message.
     */
    function importDataObject(mudData) {
        // Import area data
        return new Promise(function(resolve, reject) {
                // Import area data
                var areaTasks = [];

                for (var areaAreacode in mudData.data.areas) {
                    areaTasks.push(lib.area.async.createArea(areaAreacode, mudData.data.areas[areaAreacode.toString()]));
                }

                Promise.all(areaTasks)
                    .then(function(values) {
                        resolve(true);
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            })
            // Import rooms without exits (exits is a separate step)
            .then(function(areaSuccess) {
                return new Promise(function(resolve, reject) {
                    // Import room data
                    var roomTasks = [];

                    for (var roomAreacode in mudData.data.rooms) {
                        for (var roomIdx in mudData.data.rooms[roomAreacode.toString()]) {
                            var room = mudData.data.rooms[roomAreacode][roomIdx];

                            // If we pass room in directly without scrubbing exits, it won't import properly.
                            // Adding exits is not something that can be handled at the redmudlib level
                            // because rooms are added one at a time, and adding an exit to an un-added room will fail.
                            var roomData = Object.assign({}, room);
                            delete roomData.exits;

                            roomTasks.push(lib.room.async.addRoom(room.areacode, roomData));
                        }
                    }

                    Promise.all(roomTasks)
                        .then(function(values) {
                            resolve(true);
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            })
            // Import room exits
            .then(function(roomSuccess) {
                return new Promise(function(resolve, reject) {
                    // Import room data
                    var exitTasks = [];

                    for (var roomAreacode in mudData.data.rooms) {
                        for (var roomIdx in mudData.data.rooms[roomAreacode.toString()]) {
                            var room = mudData.data.rooms[roomAreacode][roomIdx];
                            var exits = room.exits;

                            for (var command in exits) {
                                exitTasks.push(lib.room.async.setConnection(command, room, exits[command]));
                            }
                        }
                    }

                    Promise.all(exitTasks)
                        .then(function(values) {
                            resolve(true);
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            })
            // Import users
            .then(function(exitSuccess) {
                return new Promise(function(resolve, reject) {
                    //Import user data
                    var userTasks = [];

                    if (mudData.data.users !== undefined) {
                        mudData.data.users.forEach(function(userBlock) {
                            userTasks.push(lib.user.async.createUser(userBlock.username, userBlock.pwhash));
                        });
                    }

                    Promise.all(userTasks)
                        .then(function(values) {
                            resolve(true);
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                });
            });
    }

    /**
     * Read data from a file.
     * 
     * @namespace Importer
     * @param {string} filename The file to read.
     * @returns {Promise} A promise that resolves to the file data in object form, or an error message.
     */
    function readDataFromFile(filename) {
        var fs = require('fs');

        return new Promise(function(resolve, reject) {
            // Read data from file
            fs.readFile(filename, function(err, data) {
                if (err !== null) {
                    reject(err);
                } else {
                    resolve(JSON.parse(data.toString()));
                }
            });
        });
    }

    /**
     * Import data from a file and load it into the Redis DB.
     * 
     * @namespace Importer
     * @param {string} filename The file to read.
     * @returns {Promise} A promise that resolved to true if successful, or an error message if an error is encountered.
     */
    function importDataObjectFromFile(filename) {
        return new Promise(function(resolve, reject) {
            readDataFromFile(filename)
                .then(function(mudData) {
                    return importDataObject(mudData)
                        .then(function(success) {
                            resolve(success);
                        })
                        .catch(function(err) {
                            reject(err);
                        });
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }

    return {
        object: {
            importAsync: importDataObject
        },
        file: {
            importAsync: importDataObjectFromFile
        }
    };
}

module.exports = RedMUDImporter;