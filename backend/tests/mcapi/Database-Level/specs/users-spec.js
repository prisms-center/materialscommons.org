'use strict';
require('mocha');
require('co-mocha');
const chai = require('chai');
const assert = require('chai').assert;

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});

const backend_base = '../../../..';
const dbModelUsers = require(backend_base + '/servers/mcapi/db/model/users');

let userId = "test@test.mc";
let user = null;

let random_name = function(prefix){
    let number = Math.floor(Math.random()*10000);
    return prefix + number;
};

before(function*() {
    console.log('before users-spec.js');
    user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);
    console.log('done before users-spec.js');
});

describe('Feature - Users: ', function() {
    describe('Standard Test Users', function() {
        it('each users exist - internal use', function* () {
            let users = yield dbModelUsers.getUsers();
            let ids = [];
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                ids.push(user.id);
            }
            assert(ids.indexOf("test@test.mc") > -1);
            assert(ids.indexOf("another@test.mc") > -1);
            assert(ids.indexOf("admin@test.mc") > -1);
            assert(ids.indexOf("tadmin@test.mc") > -1);
        });
        it('each users exist - external use', function* () {
            let users = yield dbModelUsers.getAllUsersExternal();
            let ids = [];
            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                ids.push(user.id);
            }
            assert(ids.indexOf("test@test.mc") > -1);
            assert(ids.indexOf("another@test.mc") > -1);
            assert(ids.indexOf("admin@test.mc") > -1);
            assert(ids.indexOf("tadmin@test.mc") > -1);
        });
    });
});
