const mongoose = require('mongoose');
const Config = require('./config'),
      config = new Config();

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
module.exports.listen = function(url){
  var url = config.database;
  try {
    mongoose.connect(url);
    console.log("Connected to " + url)
  } catch(error) {
    console.log("Could not connect to " + url + ". " + error);
  }

  return mongoose;
}
