const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory and database exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database.json:', err);
  }
  return { users: {}, tasks: {}, categories: {} };
}

function saveDatabase(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing database.json:', err);
  }
}

// Get Local WiFi/Ethernet IP for easy mobile access
function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // Enable CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // ==========================================
  // API Routes
  // ==========================================

  // Network IP Endpoint (for connecting from mobile)
  if (pathname === '/api/info' && req.method === 'GET') {
    const ip = getLocalNetworkIP();
    return sendJSON(res, 200, {
      localUrl: `http://localhost:${PORT}/`,
      networkUrl: `http://${ip}:${PORT}/`,
      ip: ip,
      port: PORT
    });
  }

  // Register Endpoint
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { email, password, displayName } = JSON.parse(body || '{}');
        if (!email || !password) {
          return sendJSON(res, 400, { success: false, message: 'Correo y contraseña son requeridos.' });
        }

        const db = loadDatabase();
        const normEmail = email.toLowerCase().trim();

        if (db.users[normEmail]) {
          return sendJSON(res, 400, { success: false, message: 'Este correo ya está registrado en el servidor.' });
        }

        const uid = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
        const newUser = {
          uid,
          email: normEmail,
          displayName: displayName || normEmail.split('@')[0],
          password: password,
          createdAt: new Date().toISOString()
        };

        db.users[normEmail] = newUser;
        if (!db.tasks[uid]) db.tasks[uid] = [];
        if (!db.categories[uid]) db.categories[uid] = [];
        saveDatabase(db);

        const safeUser = { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName };
        return sendJSON(res, 200, { success: true, user: safeUser });
      } catch (e) {
        return sendJSON(res, 500, { success: false, message: 'Error interno del servidor.' });
      }
    });
    return;
  }

  // Login Endpoint
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body || '{}');
        if (!email || !password) {
          return sendJSON(res, 400, { success: false, message: 'Correo y contraseña son requeridos.' });
        }

        const db = loadDatabase();
        const normEmail = email.toLowerCase().trim();
        const user = db.users[normEmail];

        if (!user) {
          return sendJSON(res, 404, { success: false, notFound: true, message: 'No existe una cuenta registrada con este correo.' });
        }

        if (user.password !== password) {
          return sendJSON(res, 401, { success: false, wrongPassword: true, message: 'Contraseña incorrecta. Por favor verifica tu contraseña.' });
        }

        const safeUser = { uid: user.uid, email: user.email, displayName: user.displayName };
        const tasks = db.tasks[user.uid] || [];
        const categories = db.categories[user.uid] || [];

        return sendJSON(res, 200, {
          success: true,
          user: safeUser,
          tasks: tasks,
          categories: categories
        });
      } catch (e) {
        return sendJSON(res, 500, { success: false, message: 'Error procesando solicitud.' });
      }
    });
    return;
  }

  // Get User Data (Tasks & Categories)
  if (pathname === '/api/user/data' && req.method === 'GET') {
    const uid = parsedUrl.searchParams.get('uid');
    if (!uid) {
      return sendJSON(res, 400, { success: false, message: 'Parámetro uid requerido.' });
    }

    const db = loadDatabase();
    return sendJSON(res, 200, {
      success: true,
      tasks: db.tasks[uid] || [],
      categories: db.categories[uid] || []
    });
  }

  // Save User Data (Tasks & Categories)
  if (pathname === '/api/user/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { uid, tasks, categories } = JSON.parse(body || '{}');
        if (!uid) {
          return sendJSON(res, 400, { success: false, message: 'uid requerido.' });
        }

        const db = loadDatabase();
        if (Array.isArray(tasks)) {
          db.tasks[uid] = tasks;
        }
        if (Array.isArray(categories)) {
          db.categories[uid] = categories;
        }
        saveDatabase(db);

        return sendJSON(res, 200, { success: true, updatedCount: (tasks || []).length });
      } catch (e) {
        return sendJSON(res, 500, { success: false, message: 'Error guardando datos en servidor.' });
      }
    });
    return;
  }

  // ==========================================
  // Static Files Serving
  // ==========================================
  if (pathname === '/favicon.ico') {
    const faviconPath = path.join(__dirname, 'logo.svg');
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(faviconPath).pipe(res);
    return;
  }

  let decodedPath = decodeURIComponent(pathname);
  let filePath = path.join(__dirname, decodedPath === '/' ? 'index.html' : decodedPath);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalNetworkIP();
  console.log(`====================================================`);
  console.log(`🚀 StarT Servidor Centralizado Activo en:`);
  console.log(`💻 Computadora: http://localhost:${PORT}/`);
  console.log(`📲 Celular (misma red WiFi): http://${ip}:${PORT}/`);
  console.log(`====================================================`);
});
