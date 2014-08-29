'use strict';

var Mongo = require('mongodb');

function Message(o){
  this.to = o.to;
  this.from = o.from;
  this.body = o.body;
  this.date   = new Date();
  this.isRead = false;
}

Object.defineProperty(Message, 'collection', {
  get: function(){return global.mongodb.collection('messages');}
});

Message.find = function(userId, cb){
  var id = Mongo.ObjectID(userId);
  Message.collection.find({to: id}).toArray(cb);
};

Message.read = function(query, cb){
  var id = Mongo.ObjectID(query);
  Message.collection.findOne({_id: id}, function(err, message){
    if(message.isRead){ cb(message); }
    else {
      message.isRead = true;
      Message.collection.save(message, function(){
        cb(message);
      });
    }
  });
};

module.exports = Message;

/*
function Message(senderId, receiverId, msg){
  this.date   = new Date();
  this._isRead = false;
  this.body   = msg;
  this.fromId = senderId;
  this.toId   = receiverId;
}

Object.defineProperty(Message, 'collection', {
  get: function(){return global.mongodb.collection('messages');}
});

Message.send = function(senderId, receiverId, msg, cb){
  var m = new Message(senderId, receiverId, msg);
  Message.collection.save(m, cb);
};

Message.query = function(toId, cb){
  Message.collection.find({toId:toId}).sort({date:-1}).toArray(cb);
};

module.exports = Message;
*/
