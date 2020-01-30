const http = require('http');
const fs = require('fs');
const { app } = require('./handler');

const setUpDataBase = function() {
  const data = `${__dirname}/data`;
  if (!fs.existsSync(`${data}`)) {
    fs.mkdirSync(`${data}`);
  }
};

const main = function(port) {
  setUpDataBase();
  const server = new http.Server(app.serve.bind(app));
  server.listen(port, () => process.stdout.write('listening'));
};

const defaultPort = 4000;
const getUserPort = 2;
main(process.argv[getUserPort] || defaultPort);
