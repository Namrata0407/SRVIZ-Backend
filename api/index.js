if (!process.env.DATABASE_URL) {
  require('dotenv').config();
}

try {
  const app = require('../dist/index.js').default;
  module.exports = app;
} catch (error) {
  console.error('Error loading app:', error);
  const express = require('express');
  const app = express();
  app.get('*', (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
    });
  });
  module.exports = app;
}
