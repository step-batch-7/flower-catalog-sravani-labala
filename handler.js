const fs = require('fs');
const querystring = require('querystring');
const CONTENT_TYPES = require('./lib/mimeTypes');
const { App } = require('./lib/app');
const STATIC_FOLDER = `${__dirname}/public`;
const TEMPLATES_FOLDER = `${__dirname}/templates`;
const commentsFile = `${__dirname}/data/comments.json`;
const statusCodes = { badRequest: 400, notFound: 404, redirecting: 303 };

const notFound = function(req, res) {
  res.writeHead(statusCodes.notFound);
  res.end();
};

const methodNotAllowed = function(req, res) {
  res.writeHead(statusCodes.badRequest);
  res.end();
};

const createHtmlForComments = function(html, comments) {
  const emojiSpace = 5;
  let { name, comment } = comments;
  comment = comment.replace(/\n/g, `</br>${'&nbsp'.repeat(emojiSpace)}`);
  name = name.replace(/ /g, ' &nbsp');
  comment = comment.replace(/ /g, '&nbsp');
  return (
    `<div class="comment"><p ><strong>${'&#128100'}${name}</strong>  ${
      comments.date
    }<br/>${'&#9997;'}${comment}</p></div> ` + html
  );
};

const getGuestPage = function(url) {
  if (!fs.existsSync(commentsFile)) {
    fs.writeFileSync(commentsFile, '[]');
  }
  let comments = JSON.parse(fs.readFileSync(commentsFile));
  const html = fs.readFileSync(`${TEMPLATES_FOLDER}/${url}`, 'utf8');
  comments = comments.reduce(createHtmlForComments, '');
  return html.replace('__comments__', comments);
};

const handleComment = function(req, res) {
  const { name, comment } = querystring.parse(req.body);
  const previousComments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
  previousComments.push({ name, comment, date: new Date().toLocaleString() });
  fs.writeFileSync(commentsFile, JSON.stringify(previousComments));
  const html = getGuestPage(req.url);
  res.writeHead(statusCodes.redirecting, { location: 'guestBook.html' });
  res.end(html);
};

const serveGuestPage = function(req, res) {
  const html = getGuestPage(req.url);
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  return res.end(html);
};

const validatePath = function(path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const serveStaticFile = (req, res, next) => {
  if (req.url === '/') {
    req.url = '/home.html';
  }
  const path = `${STATIC_FOLDER}${req.url}`;
  if (validatePath(path)) {
    next();
    return;
  }
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fs.readFileSync(path));
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = data;
    next();
  });
};

const app = new App();

app.use(readBody);
app.get('', serveStaticFile);
app.get('/guestBook.html', serveGuestPage);
app.post('/guestBook.html', handleComment);
app.get('', notFound);
app.post('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
