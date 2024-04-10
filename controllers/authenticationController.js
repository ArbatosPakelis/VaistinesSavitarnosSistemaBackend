const jwt = require('jsonwebtoken');

const authenticateAccessToken = (req, res, next) => {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (token == null) {
        req.error = 401;
        return;
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
        {
            req.error = 401;
            return
        }
        req.user = user;
        // next();
    });
};

const authenticateRefreshToken = (req, res, next) => {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (token == null) {
        req.error = 401;
        return;
    }
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
        {
            req.error = 403;
            return
        }
        req.user = user;
        // next();
    });

};

module.exports = {
    authenticateAccessToken,
    authenticateRefreshToken,
};