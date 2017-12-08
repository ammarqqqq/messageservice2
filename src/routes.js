const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const Config = require('./config'),
config = new Config();
const logger = require('./logger.js')

//TODO:
//const redisClient = require('redis').createClient;
//const redis = redisClient(6379, 'pushnotificationserviceredis');

const messagehandler = require('./messagehandler.js')
const emailsender = require('./emailsender.js')

messagehandler.deps.getToken = function(id) {
  return new Promise(
    function(resolve , reject) {
      PushNotificationToken.findOne({
          owner_id: id
      })
      .exec(function(err, user){
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    }
  );
}

/**
 * @api {get} /info Greeting from server
 * @apiVersion 1.0.0
 * @apiName GetInfo
 * @apiGroup Pushnotificationservice
 *
 * @apiSuccess {String} Greeting from server.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "Welcome to the user service"
 *     }
 */
router.get('/info', function (req, res) {
  res.send("Welcome to the message service");
});

/**
 * @api {post} /sendmessage Send message
 * @apiVersion 1.0.0
 * @apiName SendMessage
 * @apiGroup Messageservice
 * 
 * @param {String} jsonobject
 * 
 * @apiSuccess {Object}  status response.
 * 
 *  @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success": "true"
 *     }
 */
router.post('/sendmessage', function (req, res) {
  logger.info("sendmessage" , req.body);
  console.log("sendmessage" , req.body);
  messagehandler.sendMessage(req.body).then(response => {
  console.log("Push message response: " + JSON.stringify(response));
  return res.json({success: true});
  }).catch(error => {
    logger.error(error);
    return res.json({success: false, error: error});
  });
})

/**
 * @api {get} /getmessages Get user messages
 * @apiVersion 1.0.0
 * @apiName GetMessages
 * @apiGroup Messageservice
 * 
 * @apiParam {String} userid
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success": "true"
 *      
 *     }
 */
router.get('/getmessages/:userid', function (req, res) {
  logger.info("getmessages " , req.params);
  if (!req.params.userid) throw "No user id";
    messagehandler.getMessages(req.params.userid).then(response => {
      return res.json(response);
  }).catch(error => {
    logger.error(error);
    //return res.json({success: false, error: error});
    return  res.status(404).json({success: false, msg: 'Could not find user.'});
  });
})


/**
 * @api {get} /getmessage Get a user message
 * @apiVersion 1.0.0
 * @apiName GetMessage
 * @apiGroup Messageservice
 * 
 * @apiParam {String} messageid
 * @apiParam {String} userid
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success": "true",
 *      
 *     }
 */
router.get('/getmessage/:messageid', function (req, res) {
  logger.info("getmessage " , req.params);
  var messageId = req.params.messageid;
  var userId = req.query.userid;
  if (!messageId) throw "No message id";
  if (!userId) throw "No user id";
  messagehandler.getMessage(messageId, userId).then(response => {
      return res.json(response);
  }).catch(error => {
    logger.error(error);
    return res.json({success: false, error: error});
  });
})

/**
 * @api {post} /changestate Change the state of a user message
 * @apiVersion 1.0.0
 * @apiName ChangeState
 * @apiGroup Messageservice
 * 
 * @apiParam {String} messageid
 * @apiParam {String} userid
 * @apiParam {String} state
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success": "true",
 *      
 *     }
 */
router.post('/changestate/:messageid', function (req, res) {
  logger.info("changestate " , req.params);
  var messageId = req.params.messageid;
  var userId = req.body.userid;
  var state = req.body.state;
 
  if (!messageId) throw "No message id";
  if (!userId) throw "No user id";
  if (!state) throw "No state specified";
  
  logger.info("changestate - messageId:" , messageId, ' userId:', userId, ' state:' + state);
  messagehandler.changeMessageState(messageId, userId, state).then(response => {
      return res.json(response);
  }).catch(error => {
    logger.error(error);
    return res.json({success: false, error: error});
  });
})

/**
 * @api {post} /registerreceiver saves the push token.
 * @apiVersion 1.0.0
 * @apiName Registerreceiver
 * @apiGroup Messageservice
 * 
 * @apiHeader {String}  access-key  Users unique access-key.
 *
 * @apiSuccess {Object}  token  token information.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success": "true",
 *      "pushtoken": "98434732897839"
 *     }
 * 
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Not Found
 *     {
 *       "success": "false",
 *       "msg": "Authentication failed."
 *     }
 * 
 */
router.post('/register', function (req, res) {
  logger.info("register" , req.body);
  var token = getToken(req.headers);
  if (!token) return res.status(403).json({success: false, msg: 'Authentication failed.'});
  logger.info("decoding token ...");
  var decoded = jwt.decode(token, config.secret);
  logger.info("calling register ...");
  messagehandler.register(req.body.id, req.body.token).then(result => {
    return res.json({success: true});
  }).catch(error => {
    logger.error(error);
    return res.json({success: false, error: error});
  });
});

/**
 * @api {post} /sendemail Send email
 * @apiVersion 1.0.0
 * @apiName SendEmail
 * @apiGroup Messageservice
 * 
 * @param {String} jsonobject
 * 
 * @apiSuccess {Object}  status response.
 * 
 *  @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success": "true"
 *     }
 */
router.post('/sendemail', function (req, res) {
  logger.info("sendemail" , req.body);
  console.log("sendemail" , req.body);
  emailsender.sendemail(req.body.email, req.body.link).then(response => {
    console.log("Email response: " + response);
    return res.json({success: true});
  }).catch(error => {
    logger.error(error);
    return res.json({success: false, error: error});
  });
})

/**
 * @api {post} /getpushtoken gets the push token.
 * @apiVersion 1.0.0
 * @apiName Getpushtoken
 * @apiGroup Pushnotificationservice
 * 
 * @apiHeader {String}  owner_id  Users unique id.
 *
 * @apiSuccess {Object}  success  success information.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success": "true",
 *      "pushtoken": "98434732897839"
 *     }
 * 
 * * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Not Found
 *     {
 *       "success": "false",
 *       "msg": "Authentication failed."
 *     }
 * 
 */
/**
 * @param {String} owner_id
 * @return {String} success
 */
router.post('/getpushtoken', function (req, res) {
  logger.info("getpushtoken" , req.body);

  var token = getToken(req.headers);
  if (!token) return res.status(403).json({success: false, msg: 'Authentication failed.'});
  var decoded = jwt.decode(token, config.secret);
  messagehandler.getToken(decoded._id).then(token => {
    return res.json({success: true, pushtoken: token.token});
  }).catch(error => {
    logger.error(error);
    return res.json({success: false, error: error});
  });
});

function getToken(headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

module.exports = router;
