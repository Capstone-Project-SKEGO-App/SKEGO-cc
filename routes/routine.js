const express = require('express');
const router = express.Router();
const db = require('../database/db'); 
const moment = require('moment'); 

// Get all routines for a specific user and specific date
router.get('/', async (req, res) => {
  const { user_id, date_routine } = req.query; 
  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // If date_routine is provided, format it to 'YYYY-MM-DD'
    let query = 'SELECT * FROM tb_routine WHERE user_id = ?';
    let params = [user_id];

    if (date_routine) {
      const formattedDateRoutine = moment(date_routine, 'DD-MM-YYYY').format('YYYY-MM-DD');
      query += ' AND date_routine = ?';
      params.push(formattedDateRoutine);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Add a routine with userId
router.post('/', async (req, res) => {
  const { user_id, routine_name, time_routine, decs_routine, type_routine, date_routine, location } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const formattedDateRoutine = moment(date_routine, 'DD-MM-YYYY').format('YYYY-MM-DD');
    const [result] = await db.query(
      'INSERT INTO tb_routine (user_id, routine_name, time_routine, decs_routine, type_routine, date_routine, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, routine_name, time_routine, decs_routine, type_routine, formattedDateRoutine, location]
    );
    res.status(201).json({ message: 'Routine added successfully', routineId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a routine
router.put('/:routine_id', async (req, res) => {
  const { routine_id } = req.params;
  const { routine_name, time_routine, decs_routine, type_routine, date_routine, location } = req.body;

  try {
    // Format date_routine from DD-MM-YYYY to YYYY-MM-DD
    const formattedDateRoutine = moment(date_routine, 'DD-MM-YYYY').format('YYYY-MM-DD');
    const timedAt = new Date();

    const [result] = await db.query(
      'UPDATE tb_routine SET routine_name = ?, time_routine = ?, decs_routine = ?, type_routine = ?, date_routine = ?, location = ?, updated_at = ? WHERE routine_id = ?',
      [routine_name, time_routine, decs_routine, type_routine, formattedDateRoutine, location, timedAt, routine_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    res.json({ message: 'Routine updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a routine
router.delete('/:routine_id', async (req, res) => {
  const { routine_id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM tb_routine WHERE routine_id = ?', [routine_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Routine not found' });
    }

    res.json({ message: 'Routine deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
