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
var pwhash1 = sha256('12345');

var username2 = 'testUser2';
var pwhash2 = sha256('23456');

var userData = {
    "areas": {},
    "rooms": {},
    "users": [{
            "username": "testUser2",
            "pwhash": "9b56ca8566a48b98a8c29a7fd307038ed555123439a937eb85d9c45166881e6e"
        },
        {
            "username": "testUser1",
            "pwhash": "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5"
        }
    ]
};

describe('Import Users', function() {
    after(function() {
        return client.flushallAsync();
    });

    it('Import two users', function() {
        return imp.object.importAsync({ data: userData })
            .then(function() {
                return lib.user.async.getUsers()
                    .then(function(usernames) {
                        expect(usernames).to.have.lengthOf(2);
                        expect(usernames.sort())
                            .to.deep.equal([username1, username2].sort());

                        return Promise.all([
                                lib.user.async.getUser(usernames[0]),
                                lib.user.async.getUser(usernames[1])
                            ])
                            .then(function(results) {
                                linq.from(results).orderBy(function(u) { return u.username; }).toArray().should.deep.equal(linq.from(userData.users).orderBy(function(u) { return u.username; }).toArray());
                            });
                    });
            });
    });
});