const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const votingRoutes = require('./routes/voting');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/voting', votingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something broke!',
    error: err.message 
  });
});

const PORT = process.env.PORT || 3300;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 