const fs = require('fs');
const Response = require('./response');
const CONTENT_TYPES = require('./mimeTypes');
const TEMPLATES_FOLDER = `${__dirname}/../templates`;
const commentsFile = `${__dirname}/../public/comments.json`;

const updateComments = comments => {
  let previousComments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
  const date = new Date().toString();
  comments['date'] = date;
  previousComments.unshift(comments);
  fs.writeFileSync(commentsFile, JSON.stringify(previousComments));
};

const getGuestPage = function(comments, url) {
  let html = fs.readFileSync(`${TEMPLATES_FOLDER}/${url}`, 'utf8');
  comments = comments.map(({ name, comment, date }) => {
    return `<p>${date} ${name} ${comment}</p>`;
  });
  html = html.replace(`__comments__`, comments.join('\n'));
  return html;
};

const sendResponse = function(html) {
  const res = new Response();
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', html.length);
  res.statusCode = 200;
  res.body = html;
  return res;
};

const getComments = function() {
  return JSON.parse(fs.readFileSync(commentsFile));
};

const serveGuestPost = req => {
  const comments = getComments();
  updateComments(req.body);
  const html = getGuestPage(comments, req.url);
  return sendResponse(html);
};

const serveGuestPage = req => {
  const comments = getComments();
  const html = getGuestPage(comments, req.url);
  return sendResponse(html);
};

module.exports = { serveGuestPost, serveGuestPage };