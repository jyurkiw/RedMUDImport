var chai = require('chai');
var expect = chai.expect;
var assert = require('assert');

var redis = require('redis');

var lib = require('redmudlib')();
var imp = require('../import-lib')(lib);

var client = lib.client.instance();

var koboldValleyArea = {
    areacode: "KDV",
    name: "Kobold Valley",
    description: "A valley filled with dangerous Kobolds.",
    size: 0
};

var goblinCaveArea = {
    areacode: "GCV",
    name: "Goblin Cave",
    description: "A cave filled with goblins.",
    size: 0
};

var goblinCaveNoSize = {
    areacode: "GCV",
    name: "Goblin Cave",
    description: "A cave filled with goblins."
};

var koboldValleyUpdate = {
    name: "Kobold Death Valley",
    description: "A hot, dry valley filled with undead Kobolds."
};

var koboldAreaUpdated = {
    areacode: "KDV",
    name: "Kobold Death Valley",
    description: "A hot, dry valley filled with undead Kobolds.",
    size: 0
};

var objExportTemplate = {
    areas: {},
    rooms: {}
};

//Tests
describe('Basic area importing', function() {
    // Setup
    beforeEach(function(done) {
        client.flushall();
        done();
    });

    after(function(done) {
        client.flushall();
        done();
    });

    describe('Single Area testing', function() {
        var areaTestObj = null;

        beforeEach(function() {
            areaTestObj = Object.assign({}, objExportTemplate);
            areaTestObj.areas[koboldValleyArea.areacode.toString()] = Object.assign({}, koboldValleyArea);
        });

        it('Import a single area from an object.', function() {
            return imp.object.importAsync({ data: areaTestObj })
                .then(function() {
                    return Promise.all([
                            lib.area.async.getAreas(),
                            lib.area.async.getArea(koboldValleyArea.areacode)
                        ])
                        .then(function(values) {
                            var areasList = values[0];
                            var koboldAreaData = values[1];

                            expect(areasList).to.deep.equal([koboldValleyArea.areacode]);
                            expect(koboldAreaData).to.deep.equal(koboldValleyArea);
                        });
                });
        });

        it('Check for import argument mangling.', function() {
            var mangleTestObj = Object.assign({}, areaTestObj);
            return imp.object.importAsync({ data: areaTestObj })
                .then(function() {
                    expect(areaTestObj).to.deep.equal(mangleTestObj);
                });
        });
    });

    describe('Multi Area testing', function() {
        var areaTestObj = null;

        beforeEach(function() {
            areaTestObj = Object.assign({}, objExportTemplate);
            areaTestObj.areas[koboldValleyArea.areacode.toString()] = Object.assign({}, koboldValleyArea);
            areaTestObj.areas[goblinCaveArea.areacode.toString()] = Object.assign({}, goblinCaveArea);
        });

        it('Import a single area from an object.', function() {
            return imp.object.importAsync({ data: areaTestObj })
                .then(function(output) {
                    return Promise.all([
                            lib.area.async.getAreas(),
                            lib.area.async.getArea(koboldValleyArea.areacode),
                            lib.area.async.getArea(goblinCaveArea.areacode)
                        ])
                        .then(function(values) {
                            var areasList = values[0].sort();
                            var koboldAreaData = values[1];
                            var goblinAreaData = values[2];

                            expect(areasList).to.deep.equal([koboldValleyArea.areacode, goblinCaveArea.areacode].sort());
                            expect(koboldAreaData).to.deep.equal(koboldValleyArea);
                            expect(goblinAreaData).to.deep.equal(goblinCaveArea);
                        });
                });
        });
    });
});