const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    
    if (token) {
        jwt.verify(token, 'this is the deck tester/builder or whatever secret', (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            }
            else {
                console.log(decodedToken);
                next();
            }
        });
    }
    else {
        res.redirect('/login');
    }
}

// check current user and changes req to store user information
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    
    if (token) {
        jwt.verify(token, 'this is the deck tester/builder or whatever secret', async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            }
            else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    }
    else {
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };