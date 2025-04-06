const express = require('express');
const router = express.Router();
const { getMedicineLogs, logMedicineIntake } = require('../controllers/medicineLogController');

// GET /api/medicine-logs - Get medicine logs with filters
router.get('/', getMedicineLogs);

// POST /api/medicine-logs - Log medicine intake
router.post('/', logMedicineIntake);

module.exports = router; 