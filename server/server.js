require('dotenv').config(); 
const express = require('express');
const sequelize = require('./config/sequelize');
require('./models'); 
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



// Public routes
app.use('/auth', authRoutes);
app.use('/api',noteRoutes); 

// Protected example route
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'You accessed a protected route!', user: req.user });
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();
