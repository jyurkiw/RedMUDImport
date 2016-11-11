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
        return new Promise(function(resolve, reject) {
                // Import area data
                var areaTasks = [];

                for (var areaAreacode in mudData.data.areas) {
                    areaTasks.push(lib.area.async.createArea(areaAreacode, mudData.data.areas[areaAreacode.toString()]));
                }

                return Promise.all(areaTasks)
                    .then(function(values) {
                        resolve(true);
                    })
                    .catch(function(err) {
                        reject(err);
                    });
            })
            .then(function(areaSuccess) {
                return new Promise(function(resolve, reject) {
                    // Import room data
                    var roomTasks = [];

                    for (var roomAreacode in mudData.data.rooms) {
                        for (var roomIdx in mudData.data.rooms[roomAreacode.toString()]) {
                            var room = mudData.data.rooms[roomAreacode][roomIdx];
                            roomTasks.push(lib.room.async.addRoom(room.areacode, room));
                        }
                    }

                    return Promise.all(roomTasks)
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