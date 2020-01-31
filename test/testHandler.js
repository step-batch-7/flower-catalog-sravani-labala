const request = require('supertest');
const { app } = require('../handler');
const fs = require('fs');
const sinon = require('sinon');

describe('GET method', function() {
  it('should give the home page of the app for the url /', function(done) {
    request(app.serve.bind(app))
      .get('/')
      .expect('Content-Type', 'text/html')
      .expect(/homePage/)
      .expect(200, done);
  });
  it('should give the file not found error if the file is not present', function(done) {
    request(app.serve.bind(app))
      .get('/notFoundFile')
      .expect(404, done);
  });
  it('should give the file not found error if the file is not present', function(done) {
    request(app.serve.bind(app))
      .get('/guestBook.html/fileNotFound')
      .expect(404, done);
  });
  it('should give the guest page of the app for the url /guestBook.html', function(done) {
    request(app.serve.bind(app))
      .get('/guestBook.html')
      .expect('Content-Type', 'text/html')
      .expect(/submit/)
      .expect(200, done);
  });
});

describe('POST method', function() {
  it('should give the file not found error if the file is not present', function(done) {
    request(app.serve.bind(app))
      .post('/notFoundFile')
      .expect(404, done);
  });
  beforeEach(function() {
    sinon.replace(fs, 'writeFileSync', () => {});
  });
  it('should give the guest page of the app for the url /guestBook.html', function(done) {
    request(app.serve.bind(app))
      .post('/guestBook.html')
      .send('name=sravani&comment=trying')
      .expect(303, done);
  });
  afterEach(function() {
    sinon.restore();
  });
});

describe('Method Not Allowed', function() {
  it('should give error for method not allowed if method is not get or post', function(done) {
    request(app.serve.bind(app))
      .put('/')
      .expect(400, done);
  });
});
