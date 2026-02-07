const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head><title>BrandOS Debug Server</title></head>
    <body style="font-family: Arial, sans-serif; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h1>✅ BrandOS Debug Server Running!</h1>
      <p>Node.js version: ${process.version}</p>
      <p>Platform: ${process.platform}</p>
      <p>Time: ${new Date().toISOString()}</p>
      <h2>Available URLs:</h2>
      <ul>
        <li><a href="/demo" style="color: #fff;">Demo Page</a></li>
        <li><a href="/pixel-test.html" style="color: #fff;">Pixel Test</a></li>
      </ul>
      <p><strong>This confirms Node.js and HTTP servers work on this system.</strong></p>
    </body>
    </html>
  `);
});

const PORT = 3003;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Debug server running on http://localhost:${PORT}`);
  console.log(`🔗 Network: http://192.168.1.82:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});