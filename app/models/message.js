'use strict';

function Message(senderId, receiverId, msg){
  this.date   = new Date();
  this.body   = msg;
  this.fromId = senderId;
  this.toId   = receiverId;
  this._isRead = false;
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
