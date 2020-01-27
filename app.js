const fs = require('fs');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');
const { serveGuestPage, serveGuestPost } = require('./lib/dealComment');
const STATIC_FOLDER = `${__dirname}/public`;

const serveStaticFile = req => {
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

const serveHomePage = req => {
  req.url = '/home.html';
  return serveStaticFile(req);
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'GET' && req.url === '/guestBook.html')
    return serveGuestPage;
  if (req.method === 'POST' && req.url === '/guestBook.html')
    return serveGuestPost;
  if (req.method === 'GET') return serveStaticFile;
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
