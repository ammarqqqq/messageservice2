const mailer = require("nodemailer");
const Config = require('./config'),
  config = new Config();

var emailsender = (function() {
  var deps = {};

// Use Smtp Protocol to send Email
var smtpTransport = mailer.createTransport({
    host: config.emailServer,
    port: config.emailPort,
    secure: true, // use TLS
    
    auth: {
        user: config.emailUser,
        pass: config.emailPwd
    }
});

deps.sendemail = function(email, link) {
  return new Promise(
    function(resolve , reject) {
      smtpTransport.verify(function(error, success) {
        if (error) {
            console.log(error);
            reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve();
        }
     });
     
      //TODO: Move to an external template
      var mailOptions = {
        from: "Soci80 <jenkinsfintechinnovation@gmail.com>",
        to: email,
        subject: "Soci80 Password Reset Email",
        text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
        "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
         link + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };

      smtpTransport.sendMail(mailOptions, function(error, response) {
        if(error) {
            console.log(error);
            reject(error);
        } else {
            console.log("Message sent: " + JSON.stringify(response.message));
            resolve(response);
        }
        smtpTransport.close();
        resolve(response);
    });
  });
}

function sendemail(email, link) {
  return deps.sendemail(email, link)
}

return {
  "sendemail": sendemail,
  "deps": deps
};


})();

module.exports = emailsender;

