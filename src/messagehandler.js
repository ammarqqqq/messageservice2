const logger = require('./logger.js')
const mongoose = require('mongoose');

const models = require('./models/messagerecipient.js');

const pushsender = require('./pushsender.js');

mongoose.Promise = Promise; 

var messagehandler = (function() {
  var deps = {};

  deps.register = function(id, registrationId) {
    return new Promise(
      function(resolve , reject) {
        logger.info("Before messageRecipient");
        var recipient = new models.Recipient({
          user_id: id,
          registration_id: registrationId
          
        });
        recipient.save(function(err, result) {
          if (err) reject(err);
          logger.info("register - saved OK to Mongo - " + result);
          // redis.set(owner_id, JSON.stringify(savedToken), function () {
          logger.info("Calling resolve");
          resolve(result);
          // });
        });
    });
  }
  
  function persistMessageToMongo(jsondata) {
    logger.info("persistMessageToMongo... " );
    var messageMongoObject = new models.Message({ 'message_type': jsondata.message_type, 'title': jsondata.messagetitle, 
      'body': jsondata.messagecontent, 'attachments': jsondata.attachments});
    return messageMongoObject.save();
  }
  
  function persistUserMessageToMongo(userId, messageInfo) {
    return new Promise(
      function(resolve , reject) {
        logger.info("persistUserMessageToMongo...");
        models.Recipient.findOneAndUpdate(
          { 'user_id': userId },
          {$push:{'messages':messageInfo}},
          {new: true},
          function (err, recipient) {
            if (err) {
              console.log("persistUserMessageToMongo - Error finding recipient" + err);
              return reject(err);
             } else {
               if (recipient) {
                 console.log("persistUserMessageToMongo - Recipient: " + JSON.stringify(recipient));
                 resolve();
               } else {
                 console.log("persistUserMessageToMongo - Recipient not found: " + JSON.stringify(recipient));
                 reject();
               }
             }
         });
   });
  }
  
  

  function onPersistMessageToMongoOk(registrationId, pushInfo, recipient) {
    console.log("Persisted message OK for recipient " + recipient);
    return new Promise(
        function(resolve , reject) {
            logger.info("Sending push " + recipient);
            pushsender.sendPushToOneRecipient(registrationId, pushInfo).then(result => {
              logger.info("Push sent OK for " + recipient);
              resolve(true);
            }).catch(error => {
              console.log("Push sent failed for " + recipient);
              resolve(false);
            });
        });
  }

  deps.sendMessage = function(jsondata) {
    return new Promise(
      function(resolve , reject) {
        
        if (!jsondata || jsondata.length === 0) {
          reject("Message must have data content");
        }

        if (!jsondata.messagecontent) {
          reject("Must have message content");
        }

        if (!jsondata.recipients) {
          reject("Must have at least one recipient");
        }
        
        logger.info("sendMessage - Saving message to Mongo...");
        persistMessageToMongo(jsondata).then(messageMongoObject => {
          var messageInfo = {'message_type': jsondata.message_type, 'title': jsondata.messagetitle, 'body':jsondata.messagecontent,
          'has_attachment': jsondata.has_attachment};
          logger.info("sendMessage - message saved ok to mongo");
          var promisesForAllRecipients = [];
          var pushInfo = {'title': jsondata.notificationdata.title, 'body':jsondata.notificationdata.body};

          for (var i = 0; i < jsondata.recipients.length; i++) {
            var recipient = jsondata.recipients[i]; 
            var promiseForTheRecipient = new Promise(function(resolveForRecipient , rejectForRecipient) {
              logger.info("sendMessage - About to call getUserRegistrationId for " + recipient);
              getUserRegistrationId(recipient).then(registrationId => {
                 logger.info("sendMessage - Registration id found: " + registrationId);
                 logger.info("sendMessage - Message id: " + messageMongoObject._id);
                 pushInfo['_id'] = messageMongoObject._id;
                 messageInfo['_id'] = messageMongoObject._id;
                 messageInfo['date'] = messageMongoObject.created_at;
                 logger.info("sendMessage - Calling persistUserMessageToMongo for " + recipient);
                 persistUserMessageToMongo(recipient, messageInfo)
                   .then(resultMongo => onPersistMessageToMongoOk(registrationId, pushInfo, recipient)
                        .then(resultCallback => resolveForRecipient(resultCallback)
                        ).catch(error => resolveForRecipient(false))
                   ).catch(error => resolveForRecipient(false));
              }).catch(error => resolveForRecipient(false));
              
            });
            promisesForAllRecipients.push(promiseForTheRecipient);
          }
          Promise.all(promisesForAllRecipients).then(results => { 
            var okCount = 0, koCount = 0;
              for (var i = 0; i < results.length; i++) {
                if (results[i]) { okCount++; }
                else { koCount++; }
              }
              resolve({"sentOK":okCount,"sentFailed":koCount});
            }, reason => {
              reject(reason);
            });
        });
       
      });
  }
  
  deps.getMessages = function(userId) {
    return new Promise(function(resolve, reject) {
      logger.info("getMessages for " + userId);
        models.Recipient.findOne({
          'user_id': userId
        }).exec(function(err, recipient){
          if (err) {
            reject(err);
         } else {
           if (!recipient) { 
             reject("getMessages - Could not find user " + userId);
           } else {
             logger.info("getMessages - Recipient: " + JSON.stringify(recipient));
             resolve(recipient.messages);}
           }
         });
      });
  }
  
  deps.getMessage = function(messageId, userId) {
    return new Promise(function(resolve, reject) {
      logger.info("getMessage id " + messageId);
      logger.info( "getMessage - User id" + userId);
        models.Recipient.findOne({'user_id': userId, 'messages._id': new mongoose.mongo.ObjectId(messageId)}, {"messages.$":1}
        ).exec(function(err, recipientmessage) {
          logger.info("getMessage - recipientmessage " + recipientmessage);
          if (err) {
            reject(err);
          } else {
            if (!recipientmessage) {
              reject("getMessage - Could not find recipient message" + messageId);
            } else {
              models.Message.findOne({'_id': new mongoose.mongo.ObjectId(messageId)})
             .exec(function(err, message) {
               if (err) {
                 reject("getMessage - Could not find message details " + messageId);
                 reject(err);
               } else {
                 logger.info( "getMessage - Message" + message);
                 //Set state as READ
                 logger.info( "getMessage - recipientmessage" + recipientmessage.messages[0].state);
                 if (recipientmessage.messages[0].state !== 'READ') {
                   logger.info("getMessage - Set state to READ  for " + messageId);
                   changeMessageState(messageId, userId, 'READ');
                 }
                 resolve(message);
               }
             });
           }
         }
       });
     });
  }
  
  deps.changeMessageState = function(messageId, userId, state) {
    return new Promise(function(resolve, reject) {
      console.log("Change Message state " + messageId + " to " + state + "for user " + userId);
        models.Recipient.findOneAndUpdate(
        	  {'user_id': userId, 'messages._id': new mongoose.mongo.ObjectId(messageId)},
              { $set: { 'messages.$.state' : state }},
              {new: true}
        ).exec(function(err, recipientmessage) {
        if (err) {
          logger.info("Error changing state for " + messageId);
          reject(err);
        } else {
          logger.info("Message updated: " + JSON.stringify(recipientmessage));
          resolve(recipientmessage);
        }
      });
    });
  }
  
  function getUserRegistrationId(userId) {
    return new Promise(
      function(resolve , reject) {
        logger.info("UserRegistrationid for " + userId);
        models.Recipient.findOne({
          user_id: userId
        }).exec(function(err, recipient){
          if (err) {
            reject(err);
          } else {
            if (!recipient) {
              reject("UserRegistration. Could not find user " + userId);
            } else {
              logger.info("UserRegistration for user " + userId + " is " + recipient.registration_id);
              resolve(recipient.registration_id);
            }
         }
        });
      });
  }

  function getToken(id) {
    return deps.getToken(id);
  }

  function register(id, token) {
    return deps.register(id, token);
  }

  function sendMessage(id, jsondata) {
    return deps.sendMessage(id, jsondata);
  }
  
  function getMessage(id, userId) {
    return deps.getMessage(id, userId);
  }
  
  function getMessages(userId) {
    return deps.getMessages(userId);
  }
  
  function changeMessageState(id, userId, state) {
    return deps.changeMessageState(id, userId, state);
  }

  return {
    "register": register,
    "getToken": getToken,
    "sendMessage": sendMessage,
    "getMessage": getMessage,
    "getMessages": getMessages,
    "changeMessageState": changeMessageState,
    "getUserRegistrationId": getUserRegistrationId,
    "deps": deps
  };
})();

module.exports = messagehandler;
