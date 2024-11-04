const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/?error=Please login first');
};

module.exports = { isAuthenticated };
