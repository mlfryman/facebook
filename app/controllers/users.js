'use strict';

var User = require('../models/user'),
    Message = require('../models/message');

exports.new = function(req, res){
  res.render('users/new');
};

exports.login = function(req, res){
  res.render('users/login');
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
};

exports.create = function(req, res){
  User.register(req.body, function(err, user){
    if(user){
      res.redirect('/');
    }else{
      res.redirect('/register');
    }
  });
};

exports.authenticate = function(req, res){
  User.authenticate(req.body, function(user){
    if(user){
      req.session.regenerate(function(){
        req.session.userId = user._id;
        req.session.save(function(){
          res.redirect('/');
        });
      });
    }else{
      res.redirect('/login');
    }
  });
};

exports.edit = function(req, res){
  res.render('users/edit');
};

exports.update = function(req, res){
  res.locals.user.save(req.body, function(){
    res.redirect('/profile');
  });
};

exports.show = function(req, res){
  res.render('users/show');
};

exports.index = function(req, res){
  User.find({isVisible:true}, function(err, users){
    res.render('users/index', {users:users});
  });
};

exports.client = function(req, res){
  User.findOne({email:req.params.email, isVisible:true}, function(err, client){
    if(client){
      res.render('users/client', {client:client});
    }else{
      res.redirect('/users');
    }
  });
};

// Send messages
// TODO: can add find(filter by _id, isVisible), need to convert id to MongoID
exports.message = function(req, res){
  User.findById(req.params.userId, function(err, receiver){
    res.locals.user.send(receiver, req.body, function(){
      res.redirect('/users/' + receiver.email);
    });
  });
};


//Display all messages to given user
exports.displayMessages = function(req, res){
  Message.find(res.locals.user._id, function(err, messages){
    var unread = 0;
    messages.forEach(function(m){ unread = (m.isRead) ? unread : unread + 1; });
    res.render('users/messages', {messages: messages, unread: unread});
  });
};

//Display a single message
exports.readMessage = function(req, res){
  Message.read(req.params.messageId, function(message){
    console.log(message);
    res.render('users/view-message', {message: message});
  });
};
