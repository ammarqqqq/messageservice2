const mongoose = require('mongoose');
const Config = require('./config'),
      config = new Config();
var server = process.env.DNSDOMAIN;
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
module.exports.listen = function(url){
  //var url = config.database;
    var url = "mongodb://" +  server  +  ":27015/messages";
  try {
    //mongoose.connect(url);
      mongoose.connect(url, { useMongoClient: true });
    console.log("Connected to " + url)
  } catch(error) {
    console.log("Could not connect to " + url + ". " + error);
  }

  return mongoose;
}
