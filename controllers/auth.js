const passport = require('passport');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

// Display login form
const getLogin = (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.render('index', { 
            error: req.query.error,
            user: req.user
        });
    }
};

// Handle login form submission
const postLogin = passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/?error=Invalid credentials'
});

// Display signup form
const getSignup = (req, res) => {
    res.render('register', { 
        error: req.query.error,
        user: req.user,
        isSignup: true
    });
};

// Handle signup form submission
const postSignup = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        
        // Check if username or email already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });
        
        if (existingUser) {
            return res.redirect('/signup?error=User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            }
        });

        // Log in the user automatically
        req.login(newUser, (err) => {
            if (err) return next(err);
            return res.redirect('/dashboard');
        });

    } catch (err) {
        console.error(err);
        return res.redirect('/signup?error=Registration failed');
    }
};

// Handle logout
const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};

// Add this function to your existing auth.js controller
const getDashboard = async (req, res) => {
    try {
        const [files, folders] = await Promise.all([
            prisma.file.findMany({
                where: {
                    userId: req.user.id
                },
                include: {
                    folder: true // Include folder information
                },
                orderBy: {
                    uploadedAt: 'desc' // Add this line to sort by newest first
                }
            }),
            prisma.folder.findMany({
                where: {
                    userId: req.user.id
                }
            })
        ]);
        
        res.render('dashboard', {
            user: req.user,
            files,
            folders
        });
    } catch (error) {
        console.error(error);
        res.redirect('/?error=Failed to load dashboard');
    }
};

// Export all functions at the end
module.exports = {
    getLogin,
    postLogin,
    getSignup,
    postSignup,
    logout,
    getDashboard
};

