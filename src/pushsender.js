const logger = require('./logger.js')
const gcm = require('node-gcm');

const sender = new gcm.Sender("AIzaSyDtb-R278u30jB9uuobcls3lHHeOJ68bD4");

var pushsender = (function() {
  var deps = {};
  
  deps.sendPushToOneRecipient =  function(recipient, pushInfo) {
    return new Promise(
      function(resolve , reject) {
        var pushMessage = new gcm.Message({
          priority:'high',
          dryRun: false,
          notification:{
            title: pushInfo.title,
            body: pushInfo.body,
            icon: 'ic_launcher'
         },
         data:{
           message_id:pushInfo._id
         }
      });
      logger.info("About to send to GCM push");
      sender.send(pushMessage, { registrationTokens: [recipient] }, function (err, response) {
        if(err) {
           console.log("Error sending message from " + id + ". Error:" + err);
           reject(err);
        } else {
          if (response.failure > 0) {
             reject(response.results[0].error);
          }
          console.log("Response from GCM : " + JSON.stringify(response));
          resolve();
       }
    });
  });}
  
  function sendPushToOneRecipient(recipient, pushInfo) {
    return deps.sendPushToOneRecipient(recipient, pushInfo);
  }
  
  return {
    "sendPushToOneRecipient": sendPushToOneRecipient,
    "deps": deps
  };
  
  
})();

module.exports = pushsender;
