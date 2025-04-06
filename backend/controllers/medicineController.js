const db = require('../config/db');

// Get all medicines
const getAllMedicines = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM medicines ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a new medicine
const addMedicine = async (req, res) => {
  const { name, dosage, scheduled_time, frequency } = req.body;
  
  if (!name || !scheduled_time || !frequency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO medicines (name, dosage, scheduled_time, frequency) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, dosage, scheduled_time, frequency]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding medicine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllMedicines,
  addMedicine
}; 