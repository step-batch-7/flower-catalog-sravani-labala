const fs = require('fs');
const querystring = require('querystring');
const CONTENT_TYPES = require('./lib/mimeTypes');
const { App } = require('./lib/app');
const config = require(`${__dirname}/config`);
const STATIC_FOLDER = `${__dirname}/public`;
const TEMPLATES_FOLDER = `${__dirname}/templates`;
const commentsFile = config.DATA_STORE;
const { Comment, Comments } = require('./lib/comments');

const statusCodes = { badRequest: 400, notFound: 404, redirecting: 303 };

const notFound = function(req, res) {
  res.writeHead(statusCodes.notFound);
  res.end();
};

const methodNotAllowed = function(req, res) {
  res.writeHead(statusCodes.badRequest);
  res.end();
};

const readComments = () =>
  fs.existsSync(commentsFile) ? fs.readFileSync(commentsFile, 'utf8') : '[]';

const addComment = function(req, res) {
  const comment = new Comment(req.body.name, req.body.comment, new Date());
  const comments = Comments.load(readComments());
  comments.addComment(comment);
  fs.writeFileSync(commentsFile, comments.toJSON());
  res.writeHead(statusCodes.redirecting, {
    location: '/guestBook.html'
  });
  res.end();
};

const serveGuest = function(req, res, next) {
  if (validatePath(`${TEMPLATES_FOLDER}${req.url}`)) {
    return next();
  }
  const comments = Comments.load(readComments());
  const content = fs.readFileSync(`${TEMPLATES_FOLDER}/${req.url}`, 'utf8');
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.end(content.replace('__comments__', comments.toHTML()));
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
    return next();
  }
  const [, extension] = path.match(/.*\.(.*)$/);
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fs.readFileSync(path));
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = querystring.parse(data);
    next();
  });
};

const app = new App();

app.get('/guestBook.html', serveGuest);
app.get('', serveStaticFile);
app.get('', notFound);
app.use(readBody);
app.post('/guestBook.html', addComment);
app.post('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
