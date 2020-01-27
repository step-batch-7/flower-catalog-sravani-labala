const fs = require('fs');
const Response = require('./response');
const CONTENT_TYPES = require('./mimeTypes');
const TEMPLATES_FOLDER = `${__dirname}/../templates`;
const commentsFile = `${__dirname}/../data/comments.json`;

const updateComments = comments => {
  let previousComments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
  comments['date'] = new Date().toLocaleString();
  previousComments.unshift(comments);
  fs.writeFileSync(commentsFile, JSON.stringify(previousComments));
};

const replaceSymbols = function(comment) {
  comment = comment.replace(/\+/g, ' ');
  comment = comment.replace(/%0D%0A/g, '</br>');
  comment = comment.replace(/%3F/g, '?');
  comment = comment.replace(/%2C/g, ',');
  return comment;
};

const createHtmlForComments = function({ name, comment, date }) {
  comment = replaceSymbols(comment);
  return `<div><p ><strong>${'&#128100'}${name}</strong>  ${date}<br/>${'&#9997;'}${comment}</p></div> `;
};

const getComments = function() {
  if (!fs.existsSync(commentsFile)) fs.writeFileSync(commentsFile, '[]');
  return JSON.parse(fs.readFileSync(commentsFile));
};

const getGuestPage = function(url) {
  let comments = getComments();
  let html = fs.readFileSync(`${TEMPLATES_FOLDER}/${url}`, 'utf8');
  comments = comments.map(createHtmlForComments);
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

const serveGuestPost = req => {
  updateComments(req.body);
  const html = getGuestPage(req.url);
  let response = sendResponse(html);
  response.setHeader('location', 'guestBook.html');
  response.statusCode = 303;
  return response;
};

const serveGuestPage = req => {
  const html = getGuestPage(req.url);
  return sendResponse(html);
};

module.exports = { serveGuestPost, serveGuestPage };
