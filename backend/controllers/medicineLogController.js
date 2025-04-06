const db = require('../config/db');

// Get medicine logs with filters
const getMedicineLogs = async (req, res) => {
  try {
    let query = 'SELECT * FROM medicine_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Apply filters
    if (req.query.medicine_id) {
      query += ` AND medicine_id = $${paramIndex}`;
      params.push(req.query.medicine_id);
      paramIndex++;
    }
    
    if (req.query.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(req.query.status);
      paramIndex++;
    }
    
    if (req.query.date_from) {
      query += ` AND scheduled_datetime >= $${paramIndex}`;
      params.push(req.query.date_from);
      paramIndex++;
    }
    
    if (req.query.date_to) {
      query += ` AND scheduled_datetime <= $${paramIndex}`;
      params.push(req.query.date_to + ' 23:59:59');
      paramIndex++;
    }
    
    query += ' ORDER BY scheduled_datetime DESC';
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching medicine logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Log medicine intake
const logMedicineIntake = async (req, res) => {
  const { medicine_id, taken_datetime, status, notes } = req.body;
  
  if (!medicine_id || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // Get the scheduled time for this medicine
    const medicineResult = await db.query('SELECT scheduled_time FROM medicines WHERE id = $1', [medicine_id]);
    
    if (medicineResult.rows.length === 0) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    // Create a scheduled datetime based on the medicine's scheduled time and the date from taken_datetime
    const takenDate = new Date(taken_datetime);
    const scheduledTime = medicineResult.rows[0].scheduled_time;
    const [hours, minutes] = scheduledTime.split(':');
    
    const scheduledDatetime = new Date(takenDate);
    scheduledDatetime.setHours(parseInt(hours, 10));
    scheduledDatetime.setMinutes(parseInt(minutes, 10));
    scheduledDatetime.setSeconds(0);
    
    const result = await db.query(
      'INSERT INTO medicine_logs (medicine_id, scheduled_datetime, taken_datetime, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [medicine_id, scheduledDatetime.toISOString(), taken_datetime, status, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error logging medicine intake:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMedicineLogs,
  logMedicineIntake
}; 