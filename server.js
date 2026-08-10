const http = require('http');
const fs = require('fs');
const path = require('path');

const WEB_PORT = process.env.WEB_PORT || 3005;
const MOBILE_PORT = process.env.MOBILE_PORT || 3006;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json'
};

function serveStaticFile(req, res, defaultFile = 'index.html') {
    let requestUrl = req.url === '/' ? defaultFile : req.url;
    let filePath = path.join(__dirname, requestUrl);
    
    // Normalize path to prevent directory traversal
    filePath = path.normalize(filePath);

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - الصفحة غير موجودة</h1>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`<h1>500 - خطأ بالسيرفر: ${err.code}</h1>`);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
        }
    });
}

// Server 1: Normal WEB Version (Port 3005)
const webServer = http.createServer((req, res) => {
    serveStaticFile(req, res, 'index.html');
});

webServer.listen(WEB_PORT, () => {
    console.log(`🌐 [WEB Server] يعمل بنجاح على: http://localhost:${WEB_PORT}`);
});

// Server 2: Phone Version (Port 3006)
const mobileServer = http.createServer((req, res) => {
    serveStaticFile(req, res, 'mobile.html');
});

mobileServer.listen(MOBILE_PORT, () => {
    console.log(`📱 [PHONE Mobile Server] يعمل بنجاح على: http://localhost:${MOBILE_PORT}`);
    console.log(`\n==================================================`);
    console.log(`🚀 تم تشغيل السيرفرين بنجاح!`);
    console.log(`1️⃣ موقع الويب العادي (WEB):   http://localhost:${WEB_PORT}`);
    console.log(`2️⃣ نسخة الجوال (PHONE):       http://localhost:${MOBILE_PORT}`);
    console.log(`==================================================\n`);
});
