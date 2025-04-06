const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Import routes
const medicineRoutes = require('./routes/medicineRoutes');
const medicineLogRoutes = require('./routes/medicineLogRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/medicines', medicineRoutes);
app.use('/api/medicine-logs', medicineLogRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 