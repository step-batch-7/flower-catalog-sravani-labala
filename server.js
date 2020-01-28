const http = require('http');
const fs = require('fs');
const { methods } = require('./app');

const setUpDataBase = function() {
  const data = `${__dirname}/data`;
  if (!fs.existsSync(`${data}`)) fs.mkdirSync(`${data}`);
};

const requestListener = function(req, res) {
  const handlers = methods[req.method] || methods.NOT_ALLOWED;
  const handler = handlers[req.url] || handlers.defaultHandler;
  return handler(req, res);
};

const main = function(port) {
  setUpDataBase();
  const server = new http.Server(requestListener);
  server.listen(port, () => console.log('listening'));
};

main(process.argv[2]);
