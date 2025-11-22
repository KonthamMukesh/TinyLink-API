require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

const linkRoutes = require('./routes/link.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api', linkRoutes);


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/", (req, res) => {
  res.send("TinyLink API is running 🚀");
});

module.exports = app;
