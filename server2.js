const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World
');
});
server.listen(3003, () => console.log('Server running on port 3003'));