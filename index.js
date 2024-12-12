const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
const routineRoutes = require('./routes/routine');
const generatedRoutes = require('./routes/generated');  

require('dotenv').config();

// Middleware for parsing JSON
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/generates', generatedRoutes); 

// Default route for root "/"
app.get('/', (req, res) => {
  res.send('Welcome to Skego API!');
});

// Running server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




