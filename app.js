const fs = require('fs');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');
const STATIC_FOLDER = `${__dirname}/public`;
const TEMPLATES_FOLDER = `${__dirname}/templates`;
const commentsFile = `${__dirname}/data/comments.json`;

const updateComments = comments => {
  let previousComments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
  const date = new Date().toLocaleString();
  let { name, comment } = comments;
  previousComments.push({ name, comment, date });
  fs.writeFileSync(commentsFile, JSON.stringify(previousComments));
};

const createHtmlForComments = function(html, { name, comment, date }) {
  name = name.replace(/\n/g, '</br>');
  comment = comment.replace(/\n/g, '</br>');
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

const serveGuestPage = function(req) {
  const res = new Response();
  let html = getGuestPage(req.url);
  res.body = html;
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', html.length);
  res.statusCode = 200;
  if (req.method === 'GET') return res;
  updateComments(req.body);
  html = getGuestPage(req.url);
  res.setHeader('location', 'guestBook.html');
  res.statusCode = 303;
  res.body = html;
  return res;
};

const serveStaticFile = req => {
  if (req.url === '/') req.url = '/home.html';
  const path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) return new Response();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const content = fs.readFileSync(path);
  const res = new Response();
  res.setHeader('Content-Type', CONTENT_TYPES[extension]);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const findHandler = req => {
  if (req.url === '/guestBook.html') return serveGuestPage;
  if (req.method === 'GET') return serveStaticFile;
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
