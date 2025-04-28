const http = require('http');
const net = require('net');
const url = require('url');

// HTTP Proxy
const server = http.createServer((req, res) => {
  // Логирование
  console.log(`[HTTP] ${req.method} ${req.url}`);
  // Парсинг URL
  const parsedUrl = url.parse(req.url);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 80,
    path: parsedUrl.path,
    method: req.method,
    headers: req.headers,
  };
  // Проксирование запроса
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  req.pipe(proxyReq);
  proxyReq.on('error', (err) => {
    res.writeHead(500);
    res.end('Proxy error');
  });
});

// HTTPS Proxy (CONNECT)
server.on('connect', (req, clientSocket, head) => {
  const [host, port] = req.url.split(':');
  // Логирование
  console.log(`[HTTPS] CONNECT ${host}:${port}`);
  // Устанавливаем TCP-соединение к целевому серверу
  const serverSocket = net.connect(port, host, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });
  serverSocket.on('error', () => clientSocket.end());
});

server.listen(3128, () => {
  console.log('Proxy server listening on port 3128');
});
