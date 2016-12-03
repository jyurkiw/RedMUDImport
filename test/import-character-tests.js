var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var assert = require('assert');

var linq = require('linq');
var sha256 = require('js-sha256');
var lib = require('redmudlib')();
var imp = require('../import-lib')(lib);

var client = lib.client.instance();

var username1 = 'testUser1';
var username2 = 'testUser2';

var characterData = {
    "areas": {},
    "rooms": {},
    "users": [],
    "characters": [{
            "name": "Alder",
            "owner": "testUser1",
            "room": "RM:KDV:1"
        },
        {
            "name": "Balder",
            "owner": "testUser2",
            "room": "RM:KDV:1"
        }
    ]
};

describe('Test Character Importing', function() {
    beforeEach(function() {
        return client.flushallAsync();
    });

    after(function() {
        return client.flushallAsync();
    });

    it('Import two characters', function() {
        return imp.object.importAsync({ data: characterData })
            .then(function() {
                return Promise.all([
                        lib.character.async.getCharacters(), //0
                        lib.character.async.getCharactersForUser(username1), //1
                        lib.character.async.getCharactersForUser(username2), //2
                        lib.character.async.getCharacter(characterData.characters[0].name), //3
                        lib.character.async.getCharacter(characterData.characters[1].name) //4
                    ])
                    .then(function(results) {
                        var characterNames = [
                            characterData.characters[0].name,
                            characterData.characters[1].name
                        ].sort();

                        results.should.be.an('array');

                        results[0].should.be.an('array');
                        expect(results[0]).to.have.lengthOf(2);
                        expect(results[0].sort()).to.deep.equal(characterNames);

                        results[1].should.be.an('array');
                        expect(results[1]).to.have.lengthOf(1);
                        expect(results[1][0]).to.equal(characterData.characters[0].name);

                        results[2].should.be.an('array');
                        expect(results[2]).to.have.lengthOf(1);
                        expect(results[2][0]).to.equal(characterData.characters[1].name);

                        results[3].should.be.an('object');
                        expect(results[3].name).to.equal(characterData.characters[0].name);

                        results[4].should.be.an('object');
                        expect(results[4].name).to.equal(characterData.characters[1].name);
                    });
            });
    });
});