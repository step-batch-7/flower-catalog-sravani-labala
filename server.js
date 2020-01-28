const { processRequest } = require('./app');
const http = require('http');
const fs = require('fs');

const setUpDataBase = function() {
  const data = `${__dirname}/data`;
  if (!fs.existsSync(`${data}`)) fs.mkdirSync(`${data}`);
};

const main = function(port) {
  setUpDataBase();
  const server = new http.Server(processRequest);
  server.listen(port, () => console.log('listening'));
};

main(process.argv[2]);
