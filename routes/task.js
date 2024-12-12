const express = require('express');
const router = express.Router();
const db = require('../database/db');
const moment = require('moment-timezone');

// Get all tasks for a specific user
router.get('/', async (req, res) => {
  const user_id = req.query.user_id; 

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM tb_task WHERE user_id = ? ORDER BY priority_score DESC', [user_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Add a task with userId
router.post('/', async (req, res) => {
  const { user_id, task_name, difficulty_level, deadline, duration, priority_score, status, category, detail } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const formattedDeadline = moment(deadline, 'DD-MM-YYYY').format('YYYY-MM-DD');
    const [result] = await db.query(
      `INSERT INTO tb_task (user_id, task_name, difficulty_level, deadline, duration, priority_score, status, category, detail, hour_of_day, day_of_week, created_at, days_until_deadline) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 
               HOUR(CONVERT_TZ(NOW(), '+00:00', '+07:00')), 
               MOD(DAYOFWEEK(CONVERT_TZ(NOW(), '+00:00', '+07:00')) + 5, 7) + 1, 
               CONVERT_TZ(NOW(), '+00:00', '+07:00'), 
               DATEDIFF(?, CONVERT_TZ(NOW(), '+00:00', '+07:00')))`,
      [user_id, task_name, difficulty_level, formattedDeadline, duration, priority_score, status, category, detail, formattedDeadline]
    );

    res.status(201).json({ message: 'Task added successfully', taskId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a task
router.put('/:id_task', async (req, res) => {
  const { id_task } = req.params;
  const { task_name, difficulty_level, deadline, duration, priority_score, status, category, detail } = req.body;

  try {
    const formattedDeadline = moment(deadline, 'DD-MM-YYYY').format('YYYY-MM-DD');

    const [result] = await db.query(
      `UPDATE tb_task 
       SET task_name = ?, 
           difficulty_level = ?, 
           deadline = ?, 
           duration = ?, 
           priority_score = ?, 
           status = ?, 
           category = ?, 
           detail = ?, 
           hour_of_day = HOUR(CONVERT_TZ(NOW(), '+00:00', '+07:00')), 
           day_of_week = MOD(DAYOFWEEK(CONVERT_TZ(NOW(), '+00:00', '+07:00')) + 5, 7) + 1, 
           updated_at = CONVERT_TZ(NOW(), '+00:00', '+07:00'), 
           days_until_deadline = DATEDIFF(?, CONVERT_TZ(NOW(), '+00:00', '+07:00')) 
       WHERE id_task = ?`,
      [task_name, difficulty_level, formattedDeadline, duration, priority_score, status, category, detail, formattedDeadline, id_task]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a task
router.delete('/:id_task', async (req, res) => {
  const { id_task } = req.params;

  try {
    const [result] = await db.query('DELETE FROM tb_task WHERE id_task = ?', [id_task]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
