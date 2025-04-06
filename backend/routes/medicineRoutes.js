const express = require('express');
const router = express.Router();
const { getAllMedicines, addMedicine } = require('../controllers/medicineController');

// GET /api/medicines - Get all medicines
router.get('/', getAllMedicines);

// POST /api/medicines - Add a new medicine
router.post('/', addMedicine);

module.exports = router; 