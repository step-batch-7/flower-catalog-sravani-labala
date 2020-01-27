const fs = require('fs');
const { Server } = require('net');
const Request = require('./lib/request');
const { processRequest } = require('./app');

const handleConnection = function(socket) {
  socket.setEncoding('utf8');
  socket.on('data', text => {
    const req = Request.parse(text);
    const res = processRequest(req);
    res.writeTo(socket);
  });
};

const setUpDataBase = function() {
  const data = `${__dirname}/data`;
  if (!fs.existsSync(`${data}`)) fs.mkdirSync(`${data}`);
};

const main = function(port) {
  setUpDataBase();
  const server = new Server();
  server.on('connection', handleConnection);
  server.on('listening', () => console.log('listening'));
  server.listen(port);
};

main(process.argv[2]);
