var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var recipientSchema = new Schema({
  user_id : { type: String, required: true, unique: true },
  registration_id: { type: String },
  created_at: Number,
  updated_at: Number,
  messages: [{ message_type: String, title: String, has_attachment: Boolean, date: Number, state: { type: String, default: 'UNREAD' } }]
});

var messageSchema = new Schema({
  message_type: { type: String, required: true },
  title: { type: String, required: true },
  recipients: [String],
  sent_to: [Number],
  body: String,
  attachments: [String],
  owner_id: String,
  created_at: Number,
  updated_at: Number
});

recipientSchema.pre('update', function (next) {
  this.updated_at = new Date().getTime();
  next();
});

messageSchema.pre('update', function (next) {
  this.updated_at = new Date().getTime();
  next();
});

messageSchema.pre('save', function (next) {
  this.created_at = new Date().getTime();
  next();
});

recipientSchema.pre('save', function (next) {
  var recipient = this;

  // track history
  changes = [];
  var document = this;
  if (!document.isNew) {
    document.modifiedPaths().forEach(function(path) {
      if (path === 'messages') {
        console.log("Updating messages...");
      }

      var oldValue = document._original[path];
      var newValue = document[path];
      changes.push({
          path: path,
          oldValue: oldValue,
          newValue: newValue,
          when: new Date()
        });
    });
  }
  next();
});

recipientSchema.methods.getChanges = function () {
return changes;
};
var Recipient = mongoose.model('Recipient', recipientSchema);
var Message = mongoose.model('Message', messageSchema);

module.exports.Recipient = Recipient;
module.exports.Message = Message;
