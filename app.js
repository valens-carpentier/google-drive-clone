const sessionConfig = require('./config/prisma-session');
const passportConfig = require('./config/passport');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

sessionConfig(app);  // Initialize session first
passportConfig(app); // Then initialize passport

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import auth routes
const authRoutes = require('./routes/auth');

// Use routes
app.use('/', authRoutes);  // Authentication routes (login, signup, logout)

// Import file routes
const fileRoutes = require('./routes/files');

// Use routes
app.use('/', fileRoutes);  // Files routes

// Import folder routes
const folderRoutes = require('./routes/folders');

// Use routes
app.use('/', folderRoutes);  // Folder routes

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;