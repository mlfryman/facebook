'use strict';

var bcrypt = require('bcrypt'),
    Mongo  = require('mongodb'),
    _      = require('lodash'),
    twilio  = require('twilio'),
    Mailgun = require('mailgun-js'),
    Message = require('./message');

function User(){
}

Object.defineProperty(User, 'collection', {
  get: function(){return global.mongodb.collection('users');}
});

User.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  User.collection.findOne({_id:_id}, function(err, obj){
    cb(err, _.create(User.prototype, obj));
  });
};

User.register = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(user){return cb();}
    o.password = bcrypt.hashSync(o.password, 10);
    User.collection.save(o, cb);
  });
};

User.authenticate = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(!user){return cb();}
    var isOk = bcrypt.compareSync(o.password, user.password);
    if(!isOk){return cb();}
    cb(user);
  });
};

User.find = function(filter, cb){
  User.collection.find(filter).toArray(cb);
};

User.findOne = function(filter, cb){
  User.collection.findOne(filter, cb);
};

// TODO: Add .findMessage function



User.prototype.save = function(o, cb){
  var properties = Object.keys(o),
      self       = this;

  properties.forEach(function(property){
    switch(property){
      case 'visible':
        self.isVisible = o[property] === 'public';
        break;
      default:
        self[property] = o[property];
    }
  });

  User.collection.save(this, cb);
};

User.prototype.send = function(receiver, data, cb){
  switch(data.mtype){
    case 'text':
      sendText(receiver.phone, data.message, cb);
      break;
    case 'email':
      sendEmail(this.email, receiver.email, 'Message from Facebook for Goats', data.message, cb);
      break;
    case 'internal':
      Message.send(this._id, receiver._id, data.message, cb);
  }
};

module.exports = User;

// PRIVATE

function sendText(to, body, cb){
  if(!to){return cb();}

  var accountSid = process.env.TWSID,
      authToken  = process.env.TWTOK,
      from       = process.env.FROM,
      client     = twilio(accountSid, authToken);

  client.messages.create({to:to, from:from, body:body}, cb);
}

function sendEmail(from, to, subject, message, cb){
  var mailgun = new Mailgun({apiKey:process.env.MGAPIKEY, domain:process.env.MGDOMAIN}),
      data   = {from:from, to:to, subject:subject, text:message};

  mailgun.messages().send(data, cb);
}
