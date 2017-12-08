//var chai = require('chai');
//
//chai.config.includeStack = true;
//
//global.expect = chai.expect;
//global.AssertionError = chai.AssertionError;
//global.Assertion = chai.Assertion;
//global.assert = chai.assert;
//
//var request = require('request');
//var rp = require('request-promise');
//var MODULE = require("../src/messagehandler.js");
//const PushNotificationToken = require('../src/models/messagerecipient');
//
//// TODO: this test does not work! Maybe pattern for module is wrong
//describe('Module pattern test', function() {
//
//  it('Test saveToken',function(done) {
//
//    MODULE.deps.saveToken = function(id, token) {
//      return new Promise(
//        function(resolve , reject) {
//          var token = {
//            user_id: id,
//            registration_id: token
//          };
//          resolve(token)
//      });
//    };
//
//    var token = MODULE.register("test", "test2")
//
//    token.then(function(data) {
//      assert.equal(token.user_id, "test");
//      assert.equal(token.registration_id, "test2");
//      done();
//    }, function(error) {
//      done(error);
//    });
//
//  })
//
//
//  it('Test getToken',function(done) {
//
//    MODULE.deps.getToken = function(id) {
//      return new Promise(
//        function(resolve , reject) {
//          var token = {
//            owner_id: id,
//            token: token
//          };
//          resolve(token)
//      });
//    };
//
//    MODULE.getToken("test").then(token => {
//        assert.equal(token.user_id, "test");
//        assert.equal(token.token, "test2");
//        done();
//    }).catch(error => {
//      assert.equal(error, new Error("Not norwegian nr"));
//      done(error);
//    });
//
//  })
//
// it('Test sending a message',function(done) {
//
//    var token = MODULE.sendMessage("test", {}).then(token => {
//      console.log(token)
//      assert.equal(token.user_id, "test");
//      assert.equal(token.registration_id, "test2");
//      done();
//    }).catch(error => {
//      assert.equal(error, new Error("Not norwegian nr"));
//      done(error);
//    });
//
//  })
//})
