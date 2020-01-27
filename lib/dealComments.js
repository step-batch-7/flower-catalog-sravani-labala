const fs = require('fs');
const Response = require('./response');
const CONTENT_TYPES = require('./mimeTypes');
const TEMPLATES_FOLDER = `${__dirname}/../templates`;
const commentsFile = `${__dirname}/../public/comments.json`;

const updateComments = comments => {
  let previousComments = JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
  comments['date'] = new Date().toLocaleString();
  previousComments.unshift(comments);
  fs.writeFileSync(commentsFile, JSON.stringify(previousComments));
};

const replaceSymbols = function(comment) {
  return comment.replace(/\+/g, ' ').replace(/%0D%0A/g, '</br>');
};

const createHtmlForComments = function({ name, comment, date }) {
  comment = replaceSymbols(comment);
  return `<div><p><span>${name}</span>  ${date}</p><p>${comment}</p></div> `;
};

const getGuestPage = function(comments, url) {
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

const getComments = function() {
  if (!fs.existsSync(commentsFile)) fs.writeFileSync(commentsFile, '[]');
  return JSON.parse(fs.readFileSync(commentsFile));
};

const serveGuestPost = req => {
  const comments = getComments();
  updateComments(req.body);
  const html = getGuestPage(comments, req.url);
  let response = sendResponse(html);
  response.setHeader('location', 'guestBook.html');
  response.statusCode = 303;
  return response;
};

const serveGuestPage = req => {
  const comments = getComments();
  const html = getGuestPage(comments, req.url);
  return sendResponse(html);
};

module.exports = { serveGuestPost, serveGuestPage };
