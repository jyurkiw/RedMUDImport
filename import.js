/**
 * Import function for node command line execution.
 * Takes a single argument: The filename to read from.
 * Usage: npm start -- <filename>
 * 
 * @namespace cli
 */
function importAll() {
    var filename = process.argv[2];

    if (filename !== null) {
        var lib = require('redmudlib')();
        var client = lib.client.instance();
        var imp = require('./import-lib')(lib);

        imp.file.importAsync(filename)
            .then(function() {
                console.log("Import successfully read from " + filename);
                client.quit();
            })
            .catch(function(err) {
                console.log(err);
                client.quit();
            });
    }
}

importAll();