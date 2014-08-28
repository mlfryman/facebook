/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    User      = require('../../app/models/user'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'facebook-test';

describe('User', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      done();
    });
  });

  describe('#save', function(){
    it('should save a user', function(){
      var u = new User(),
          o = {x:3, visible:'public', foo:'bar'};

      u.baz = 'bim';
      u.save(o, function(err, user){
        expect(user.isVisible).to.be.true;
        expect(user.foo).to.equal('bar');
        expect(user.baz).to.equal('bim');
      });
    });
  });

  describe('.find', function(){
    it('should find users who are public', function(){
      User.find({isVisible:true}, function(err, users){
        expect(users).to.have.length(2);
      });
    });
  });

  describe('.findOne', function(){
    it('should find a specific user', function(){
      User.findOne({email:'bob_goat@aol.com', isVisible:true}, function(err, user){
        expect(user.email).to.equal('bob_goat@aol.com');
      });
    });
  });
  describe('#send', function(){
    // test successful Twilio text message
    it('should send a text message to a user', function(done){
      User.findById('000000000000000000000001', function(err, sender){ // bob_goat = sender
        User.findById('000000000000000000000002', function(err, receiver){ // suzi = receiver
          sender.send(receiver, {mtype:'text', message:'yo, this is a text message'}, function(err, response){ // req.body = {mtype, message}; twilio calls us back in function(err, response) if text sent successfully
            // console.log('SEND.....', err, response);
            expect(response.sid).to.be.ok;
            done();
          });
        });
      });
    });
    // test successful Mailgun email message
    it('should send an email message to a user', function(done){
      User.findById('000000000000000000000001', function(err, sender){
        User.findById('000000000000000000000002', function(err, receiver){
          sender.send(receiver, {mtype:'email', message:'yo, this is an email message'}, function(err, response){
            // console.log('SEND.....', err, response);
            expect(response.id).to.be.ok;
            done();
          });
        });
      });
    });
    // test successful internal message
    it('should send an internal message to a user', function(done){
      User.findById('000000000000000000000001', function(err, sender){
        // console.log('SENDER.....', err, sender);
        User.findById('000000000000000000000002', function(err, receiver){
          // console.log('RECIEVER.....', err, receiver);
          sender.send(receiver, {mtype:'internal', message:'yo, this is an internal message'}, function(err, response){
            // console.log('SEND INTERNAL.....', err, response);
            expect(response.id).to.be.ok;
            done();
          });
        });
      });
    });
  });

// Last bracket
});
