const request = require('supertest');
const { app } = require('../handler');
const fs = require('fs');
const sinon = require('sinon');

describe('GET method for pages', function() {
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
  it('should give the abeliophyllum page of the app for the url /abeliophyllum.html', function(done) {
    request(app.serve.bind(app))
      .get('/abeliophyllum.html')
      .expect('Content-Type', 'text/html')
      .expect(/Abeliophyllum.pdf/)
      .expect(200, done);
  });
  it('should give the guest page of the app for the url /ageratum.html', function(done) {
    request(app.serve.bind(app))
      .get('/ageratum.html')
      .expect('Content-Type', 'text/html')
      .expect(/Ageratum.pdf/)
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

describe('GET method for css', function() {
  it('should give the css for the app for flower.css', function(done) {
    request(app.serve.bind(app))
      .get('/css/flower.css')
      .expect('Content-Type', 'text/css')
      .expect(/#content {/)
      .expect(200, done);
  });
  it('should give the css for the app for guestbook.css', function(done) {
    request(app.serve.bind(app))
      .get('/css/guestbook.css')
      .expect('Content-Type', 'text/css')
      .expect(/#commentBox {/)
      .expect(200, done);
  });
  it('should give the css for the app for home.css', function(done) {
    request(app.serve.bind(app))
      .get('/css/home.css')
      .expect('Content-Type', 'text/css')
      .expect(/#homePage {/)
      .expect(200, done);
  });
});

describe('GET method for images', function() {
  it('should give the image for the app for animated jar', function(done) {
    request(app.serve.bind(app))
      .get('/images/animatedBucket.gif')
      .expect('Content-Type', 'image/gif')
      .expect(200, done);
  });
  it('should give the image for the app for catalog image', function(done) {
    request(app.serve.bind(app))
      .get('/images/catalogImage.jpg')
      .expect('Content-Type', 'image/jpg')
      .expect(200, done);
  });
  it('should give the image for the app for pbase-Abeliophyllum image', function(done) {
    request(app.serve.bind(app))
      .get('/images/pbase-Abeliophyllum.jpg')
      .expect('Content-Type', 'image/jpg')
      .expect(200, done);
  });
  it('should give the image for the app for pbase-agerantum image', function(done) {
    request(app.serve.bind(app))
      .get('/images/pbase-agerantum.jpg')
      .expect('Content-Type', 'image/jpg')
      .expect(200, done);
  });
});

describe('GET method for pdf', function() {
  it('should give the pdf for the app for Abeliophyllum pdf', function(done) {
    request(app.serve.bind(app))
      .get('/pdf/Abeliophyllum.pdf')
      .expect('Content-Type', 'application/pdf')
      .expect(200, done);
  });
  it('should give the pdf for the app for agerantum pdf', function(done) {
    request(app.serve.bind(app))
      .get('/pdf/Ageratum.pdf')
      .expect('Content-Type', 'application/pdf')
      .expect(200, done);
  });
});
