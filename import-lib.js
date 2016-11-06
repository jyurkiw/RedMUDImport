/**
 * An import tool for RedMUD.
 * Loads the contents of a RedMUD Export file to the Redis server.
 * 
 * @param {any} mudlib A mud-lib object.
 */
function RedMUDImport(mudlib) {
    var libs = [];
    libs.push(require('./lib/importer')(mudlib));

    var exLib = {};

    for (var i = 0; i < libs.length; i++) {
        var lib = libs[i];

        for (var libHeader in lib) {
            exLib[libHeader] = lib[libHeader];
        }
    }

    return exLib;
}

module.exports = RedMUDImport;