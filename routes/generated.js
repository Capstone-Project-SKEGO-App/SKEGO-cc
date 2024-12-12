const express = require('express');
const router = express.Router();
const db = require('../database/db');
const axios = require('axios');
const moment = require('moment-timezone'); // Library for date format

// Generate priority scores for tasks
router.post('/', async (req, res) => {
  const user_id = req.body.user_id;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Fetch tasks from the database
    console.log("Fetching tasks for user_id:", user_id);
    const [tasks] = await db.query(
      'SELECT * FROM tb_task WHERE user_id = ? AND priority_score IS NULL',
      [user_id]
    );

    if (tasks.length === 0) {
      console.log("No tasks found for user_id:", user_id);
      return res.status(200).json({ message: 'No tasks to generate priority for' });
    }

    // Prepare tasks payload for Flask API
    const flaskPayload = {
      tasks: tasks.map(task => ({
        task_id: task.id_task,
        difficulty_level: task.difficulty_level,
        duration: task.duration,
        deadline: moment(task.deadline).format('YYYY-MM-DD HH:mm:ss') 
      }))
    };
    console.log("Payload to Flask API:", JSON.stringify(flaskPayload, null, 2));

    // Call Flask API for predictions
    const flaskResponse = await axios.post(
      'https://model-ml-619804298613.asia-southeast2.run.app/predict',
      flaskPayload
    );
    console.log("Flask API response:", flaskResponse.data);

    // Validate Flask response
    if (!Array.isArray(flaskResponse.data)) {
      throw new Error("Invalid response format from Flask API");
    }

    // Update database with predictions
    const predictions = flaskResponse.data;
    for (const prediction of predictions) {
      console.log(`Updating task ${prediction.task_id} with priority_score ${prediction.priority_level}`);
      await db.query(
        'UPDATE tb_task SET priority_score = ? WHERE id_task = ?',
        [prediction.priority_level, prediction.task_id]
      );
    }

    res.json({ message: 'Priority scores updated successfully', predictions });
  } catch (error) {
    console.error("Error occurred:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// Get tasks with priority_score for a specific user
router.get('/', async (req, res) => {
  const user_id = req.query.user_id; 

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    console.log("Fetching tasks with priority_score for user_id:", user_id);
    const [tasks] = await db.query(
      `SELECT * FROM tb_task 
       WHERE user_id = ? AND priority_score IS NOT NULL 
       ORDER BY priority_score DESC`,
      [user_id]
    );

    if (tasks.length === 0) {
      return res.status(200).json({ message: 'No tasks found with priority_score for this user' });
    }

    res.json({ tasks });
  } catch (error) {
    console.error("Error occurred while fetching tasks:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
