process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');

let chai = require('chai');
let expect = require('chai').expect;
let should = require('chai').should;
let assert = require('chai').assert;
let sinon = require('sinon');

var request = require('request');
var rp = require('request-promise');


let server = require('../src/server');
let models = require('../src/models/messagerecipient');

chai.use(require('chai-http'));

describe('Integration-test: Server, Messages', () => {

  const messageId = "5937dfdd6b5a98eb2c7b3add";
  const userId = "TEST_USER_ID";
  
  var sendPushStub = sinon.stub(require('../src/pushsender.js'), 'sendPushToOneRecipient').returns(
   new Promise(
    function(resolve , reject) {
      resolve()
    }
  )
);
  
  beforeEach((done) => { //Before each test we empty the database
    models.Recipient.remove({}, (err) => {
      console.log("Recipient.remove");
      models.Message.remove({}, (err) => {
    	console.log("Message.remove");
          });
    	});
      var recipient = new models.Recipient({
        user_id: "TEST_USER_ID",
        registration_id: "TEST_REG_ID"
      });
      recipient.save({}, (err) => {
    	done();
      });
  });


/*
 * Test the /GET info route
 */
 describe('/GET info', () => {
     it('it should send an info message', (done) => {
       chai.request(server)
       .get('/info')
       .end(function(err, res) {
         expect(err).to.be.null;
         expect(res).to.have.status(200);
         done();
       });
     });
 });

 
 /*
 * Test the /POST sendMessage route
 */
 describe('/Post register recipient', () => {
     it('it should return 403 if no auth header provided ', (done) => {
       chai.request(server)
           .post('/register')
           .set('content-type', 'application/x-www-form-urlencoded')
           .send(
             {
               "id":"USER_TEST_REGISTER",
               "token": "TOKEN_TEST_REGISTER"
             }
           )
           .end(function(err, res) {
             expect(res).to.have.status(403);
             expect(res).to.be.json;
             done();
           });
     });
 }); 
 
 //TODO: change code to go to auth service and mock it in test
// describe('/Post register recipient', () => {
//   it('it should return 200 if auth header provided', (done) => {
//     chai.request(server)
//         .post('/register')
//         .set('content-type', 'application/x-www-form-urlencoded')
//         .set('Authorization', 'Bearer bla')
//         .send(
//           {
//             "id":"USER_TEST",
//             "token": "TEST_TOKEN"
//           }
//         )
//         .end(function(err, res) {
//           expect(err).to.be.null;
//           expect(res).to.have.status(200);
//           expect(res).to.be.json;
//           expect(res.body).to.have.property('success').eql(true);
//           done();
//         });
//   });
//}); 
 /*
* Test the /POST sendMessage route
*/
describe('/Post send message', () => {
    it('it should POST create new message for a existing recipient', (done) => {
      chai.request(server)
          .post('/sendmessage')
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(
            {
              "owner_id":"TEST",
              "message_type": "INBOX",
              "has_attachment":"true",
              "attachments": ["http://document.pdf"],
              "messagetitle":"Test message",
              "messagecontent":"Some content", 
              "recipients":[userId], 
              "notificationdata":{"title":"Soci80", "body":"You have a new message"}
            }
          )
          .end(function(err, res) {
            expect(err).to.be.null;
            assert(sendPushStub.calledOnce);
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.have.property('success');
            done();
          });
    });
});
  
/*
 * Test the /GET messages route
 */
 describe('/Get all the messages of a user', () => {
     it('it should return 404 if the recipient doesnt exist ', (done) => {
       const userid = 'NO_USER_ID';
       chai.request(server)
           .get('/getmessages/' + userid)
           .end(function(err, res) {
             expect(res).to.have.status(404);
             expect(res).to.be.json;
             done();
           });
     });
 });
   
 /*
  * Test the /GET messages route
  */
  describe('/Get all the messages of a user', () => {
      it('it should return 200 if the user exist but have no messages', (done) => {
        chai.request(server)
         .get('/getmessages/' + userId)
         .end(function(err, res) {
           expect(res).to.have.status(200);
           expect(res).to.be.json;
           expect(res.body).to.have.length(0);
           done();
         });
    });
  });

/*
 * Test the /GET messages route
 */
 describe('/Get all the messages of a user', () => {
     it('it should return 200 and the message, if the user exists', (done) => {
     createTestMessage(userId, messageId).then(result => {
       chai.request(server)
        .get('/getmessages/' + userId)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(1);
          done();
        });
      }).catch(error => {
        fail();
      });
   });
 });

/*
 * Test the /GET message route
 */
 describe('/Get users message', () => {
     it('it should return success = FALSE if the message doesnt exist', (done) => {
       const wrongMessageId = '1111dfdd6b5a98eb2c1a1aaa';
       createTestMessage(userId, messageId).then(result => {
         chai.request(server)
           .get('/getmessage/' + wrongMessageId)
           .query({userid: userId})
           .end(function(err, res) {
             expect(res).to.have.status(200);
             expect(res).to.be.json;
             expect(res.body).to.have.property("success", false);
             done();
           });
       }).catch(error => {
         assert.fail("","",error)
       });
    });
 });
 
 /*
  * Test the /GET message route
  */
  describe('/Get users message details', () => {
    it('it should return 200 ', (done) => {
      createTestMessage(userId, messageId).then(result => {
        chai.request(server)
            .get('/getmessage/' + messageId)
            .query({userid: userId})
            .end(function(err, res) {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              done();
            });
          }).catch(error => {
            error.response.body.should.have.property("error");
        });
      });
  });
 
 /*
  * Test the /POST changemessagefolder route
  */
  describe('/Post change message state', () => {
      it('it should POST changestate to READ ', (done) => {
        createTestMessage(userId, messageId).then(result => {
        chai.request(server)
            .post('/changestate/' + messageId)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(
              {
                "userid": userId,
                "state": "READ"
              }
            )
            .end(function(err, res) {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              done();
            });
        }).catch(error => {
          error.response.body.should.have.property("error");
      });
    });
  });
  
});//End parent block


/////////// Utility methods

function createTestMessage(userId, messageId) {
  return new Promise(
    function(resolve , reject) {
      var message = new models.Message({'_id': new mongoose.mongo.ObjectId("5937dfdd6b5a98eb2c7b3add"), 'message_type': 'INBOX', 'title': 'Some title', 
        'body': 'Some content', 'recipients':['TEST_USER_ID'], 'attachments': ["http://att.pdf"]});
      var messageInfo = {'_id':  new mongoose.mongo.ObjectId("5937dfdd6b5a98eb2c7b3add"), 'message_type': 'INBOX', 'title': 'Some title', 'body':'Some content',
          'has_attachment': true};
      message.save(function(err) {
          // we've saved the dog into the db here
          if (err) throw err;
          models.Recipient.findOneAndUpdate(
            { 'user_id': userId },
            {$push:{'messages':messageInfo}},
            {new: true},
            function (err, recipient) {
              if (err) {
                return reject(err);
               } else {
                 if (recipient) {
                   resolve();
                 } else {
                   reject();
                 }
               }
           });
      });
 });
}