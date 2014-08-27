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


// Last bracket
});
