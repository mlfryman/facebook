/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    Message   = require('../../app/models/message'),
    dbConnect = require('../../app/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'facebook-test';

describe('Message', function(){
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

  describe('constructor', function(){
    it('should create a new Message object', function(){
      var m = {to: 'Suzi del Goat', from: 'Bob Goat', body: 'yo'},
      message = new Message(m);
      expect(message).to.be.instanceof(Message);
      expect(message.to).to.equal('Suzi del Goat');
      expect(message.from).to.equal('Bob Goat');
      expect(message.body).to.include('yo');
    });
  });

  describe('.find', function(){
    it('should find a users received messages', function(done){
      Message.find('000000000000000000000002', function(err, messages){ // Suzi del Goat's messages
        expect(messages).to.have.length(1);
        done();
      });
    });
  });

  describe('.read', function(){
    it('should display a single message and mark it as read', function(done){
      Message.read('a00000000000000000000001', function(message){ // read Bob Goat's message
        expect(message.isRead).to.be.true;
        done();
      });
    });
  });

});
