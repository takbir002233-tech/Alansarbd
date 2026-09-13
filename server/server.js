const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const compression = require('compression');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach io instance to express app
app.set('io', io);

// Middlewares - Increased limit for base64 photo uploads
app.use(cors());

// Enable GZIP/Deflate compression for fast loading and reduced data usage
app.use(compression({
  threshold: 1024
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploaded photos with caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d'
}));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const voucherRoutes = require('./routes/vouchers');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');
const reviewRoutes = require('./routes/reviews');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    store: 'AL ANSAR Luxury Fragrance & Gifts API',
    timestamp: new Date().toISOString()
  });
});

// Socket.io Real-time Event Handlers
io.on('connection', (socket) => {
  socket.on('join_chat_room', (convId) => {
    socket.join(convId);
  });

  socket.on('join_admin_channel', () => {
    socket.join('admin_channel');
  });
});

const fs = require('fs');

// Serve preview route
const clientDistPath = path.join(__dirname, '../client/dist');
app.get(['/preview', '/preview.html'], (req, res) => {
  const previewDist = path.join(clientDistPath, 'preview.html');
  const previewBrain = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\1ad9fe0d-4a65-40dd-aaae-eb41dc0ea843\\preview.html';
  const target = fs.existsSync(previewDist) ? previewDist : previewBrain;
  if (fs.existsSync(target)) {
    return res.type('html').send(fs.readFileSync(target, 'utf8'));
  }
  return res.send('Preview file not found.');
});

// Live Dev Proxy to Vite:
// If Vite dev server (port 5173) is running, proxy frontend requests to Vite so file edits appear instantly on refresh!
app.use((req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads') || req.url.startsWith('/socket.io')) {
    return next();
  }

  const options = {
    hostname: '127.0.0.1',
    port: 5173,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:5173' }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', () => {
    // If Vite dev server is not active, fallback to production dist
    next();
  });

  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    req.pipe(proxyReq, { end: true });
  } else {
    proxyReq.end();
  }
});

// Production fallback: Serve client static build with aggressive caching for hashed assets
app.use(express.static(clientDistPath, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.includes(`${path.sep}assets${path.sep}`) || filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

app.use((req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads') || req.url.startsWith('/socket.io')) {
    return next();
  }
  const indexHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.sendFile(indexHtml);
  } else {
    res.send('AL ANSAR API Server is running.');
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🌸 AL ANSAR E-Commerce Server is running on port ${PORT}`);
  console.log(`📡 REST API endpoint: http://localhost:${PORT}/api`);
  console.log(`⚡ WebSocket Socket.io enabled`);
  console.log(`======================================================\n`);
});
