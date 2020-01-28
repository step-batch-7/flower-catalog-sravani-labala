const fs = require('fs');
const querystring = require('querystring');
const STATIC_FOLDER = `${__dirname}/public`;
const TEMPLATES_FOLDER = `${__dirname}/templates`;
const commentsFile = `${__dirname}/data/comments.json`;
const CONTENT_TYPES = {
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  gif: 'image/gif',
  jpg: 'image/jpg'
};

const notFound = function(req, res) {
  res.writeHead(404);
  res.end();
};

const methodNotAllowed = function(req, res) {
  res.writeHead(400);
  res.end();
};

const createHtmlForComments = function(html, { name, comment, date }) {
  name = name.replace(/\n/g, '</br>');
  comment = comment.replace(/\n/g, `</br>${'&nbsp'.repeat(5)}`);
  name = name.replace(/ /g, ' &nbsp');
  comment = comment.replace(/ /g, '&nbsp');
  return (
    `<div class="comment"><p ><strong>${'&#128100'}${name}</strong>  ${date}<br/>${'&#9997;'}${comment}</p></div> ` +
    html
  );
};

const getGuestPage = function(url) {
  if (!fs.existsSync(commentsFile)) fs.writeFileSync(commentsFile, '[]');
  let comments = JSON.parse(fs.readFileSync(commentsFile));
  let html = fs.readFileSync(`${TEMPLATES_FOLDER}/${url}`, 'utf8');
  comments = comments.reduce(createHtmlForComments, '');
  html = html.replace(`__comments__`, comments);
  return html;
};

const handleComment = function(text) {
  let { name, comment } = querystring.parse(text);
  let previousComments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
  previousComments.push({ name, comment, date: new Date().toLocaleString() });
  fs.writeFileSync(commentsFile, JSON.stringify(previousComments));
};

const serveGuestPage = function(req, res) {
  let html = getGuestPage(req.url);
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  if (req.method === 'GET') return res.end(html);
  let data = '';
  req.on('data', text => (data += text));
  req.on('end', () => {
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded')
      handleComment(data);
    html = getGuestPage(req.url);
    res.writeHead(303, { location: 'guestBook.html' });
    res.end(html);
  });
};

const serveStaticFile = (req, res) => {
  if (req.url === '/') req.url = '/home.html';
  const path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return notFound(req, res);
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.end(fs.readFileSync(path));
};

const handlers = {
  '/guestBook.html': serveGuestPage,
  defaultHandler: serveStaticFile
};

const methods = {
  GET: handlers,
  POST: handlers,
  NOT_ALLOWED: { defaultHandler: methodNotAllowed }
};

module.exports = { methods };
