const jwt = require('jsonwebtoken');

// Middleware to authenticate the JSON web token sent in request headers.
// Used to verify the user and associate actions (e.g. posting a review) with them.
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user; // { id, username }
        next();
    });
}

module.exports = { authenticateToken };