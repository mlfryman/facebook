/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'facebook-test';

var expect  = require('chai').expect,
    cp      = require('child_process'),
    app     = require('../../app/index'),
    cookie  = null,
    request = require('supertest');

describe('users', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app)
      .post('/login')
      .send('email=bob_goat@aol.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('get /profile/edit', function(){
    it('should show the edit profile page', function(done){
      request(app)
      .get('/profile/edit')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob_goat@aol.com');
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        expect(res.text).to.include('Public');
        done();
      });
    });
  });

  describe('put /profile', function(){
    it('should edit the profile', function(done){
      request(app)
      .post('/profile')
      .send('_method=put&visible=public&email=bob_goat%40aol.com&phone=6159738933&photo=photourl&tagline=so+cool&facebook=facebookurl&twitter=twitterurl')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');  // Test you are redirected to the right page
        done();
      });
    });
  });

  describe('get /profile', function(){
    it('should show the user\'s profile page', function(done){
      request(app)
      .get('/profile')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob_goat@aol.com');
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        expect(res.text).to.include('Facebook');
        done();
      });
    });
  });

  describe('get /users', function(){
    it('should show all public users', function(done){
      request(app)
      .get('/users')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob_goat@aol.com');
        expect(res.text).to.include('melanie@frymanet.com');
        expect(res.text).to.not.include('sgoatly@aol.com');
        done();
      });
    });
  });

  describe('get /users/bob_goat@aol.com', function(){
    it('should show a specific user', function(done){
      request(app)
      .get('/users/bob_goat@aol.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob_goat@aol.com');
        done();
      });
    });

    it('should NOT show a specific user - not public', function(done){
      request(app)
      .get('/users/sgoatly@aol.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users');
        done();
      });
    });
  });

  describe('post /message/userId', function(){
    it('should send a user a message', function(done){
      request(app)
      .post('/message/000000000000000000000002')
      .set('cookie', cookie)
      .send('mtype=text&message=hey')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/melanie@frymanet.com');
        done();
      });
    });
    it('should send an email message to recipient', function(done){
      request(app)
      .post('/message/000000000000000000000002')
      .send('mtype=email&message=hey')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/melanie@frymanet.com');
        done();
      });
    });
  });

// Last bracket
});

