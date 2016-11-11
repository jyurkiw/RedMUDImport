var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
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

var goblinValleyArea = {
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

var westernOverlook = {
    areacode: koboldValleyArea.areacode,
    roomnumber: 1,
    name: 'Western Overlook',
    description: 'A short cliff overlooks a small, fertile valley. You can see scores of Kobolds milling about doing whatever it is Kobolds do.'
};

var goblinCaveEntrance = {
    areacode: goblinValleyArea.areacode,
    roomnumber: 1,
    name: 'Cave Entrance',
    description: 'The opening to this dank cave reeks of Goblin.'
};

var goblinCaveTunnel = {
    areacode: goblinValleyArea.areacode,
    roomnumber: 2,
    name: 'Narrow Corridor',
    description: 'The cave stretches on into the darkness. '
};

var objExportTemplate = {
    areas: {},
    rooms: {}
};

//Tests
describe('Basic room importing', function() {
    // Setup
    beforeEach(function() {
        return client.flushallAsync()
            .then(function() {
                return Promise.all([
                    lib.area.createArea(koboldValleyArea.areacode, koboldValleyArea),
                    lib.area.createArea(goblinValleyArea.areacode, goblinValleyArea)
                ]);
            });
    });

    after(function() {
        return client.flushallAsync();
    });

    describe('Single Room testing', function() {
        var roomTestObj = null;

        beforeEach(function() {
            roomTestObj = Object.assign({}, objExportTemplate);
            roomTestObj.rooms[koboldValleyArea.areacode.toString()] = [westernOverlook];
        });

        it('Import single room', function() {
            return imp.object.importAsync({ data: roomTestObj })
                .then(function() {
                    return lib.room.async.getRoom(westernOverlook.areacode, westernOverlook.roomnumber)
                        .then(function(room) {
                            should.exist(room);
                            room.should.deep.equal(westernOverlook);
                        });
                });
        });
    });

    describe('Multi Room testing', function() {
        var roomTestObj = null;

        beforeEach(function() {
            roomTestObj = Object.assign({}, objExportTemplate);
            roomTestObj.rooms[koboldValleyArea.areacode.toString()] = [goblinCaveEntrance, goblinCaveTunnel];
        });

        it('Import multiple rooms', function() {
            return imp.object.importAsync({ data: roomTestObj })
                .then(function() {
                    return lib.room.async.getRoom(goblinCaveEntrance.areacode, goblinCaveEntrance.roomnumber)
                        .then(function(room) {
                            should.exist(room);
                            room.should.deep.equal(goblinCaveEntrance);
                        })
                })
                .then(function() {
                    return lib.room.async.getRoom(goblinCaveTunnel.areacode, goblinCaveTunnel.roomnumber)
                        .then(function(room) {
                            should.exist(room);
                            room.should.deep.equal(goblinCaveTunnel);
                        });
                });
        });
    });
});