const jwt = require('jsonwebtoken');

const authenticateAccessToken = async(req, res, next) => {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (token == null) {
        req.error = 401;
        return;
    }
    try {
        const user = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = user;
    } catch (err) {
        req.error = 401;
    }
};

const authenticateRefreshToken = async(req, res, next) => {
    const header = req.headers['authorization'];
    const token = header && header.split(' ')[1];
    if (token == null) {
        req.error = 401;
        return;
    }
    try {
        const user = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        req.user = user;
    } catch (err) {
        req.error = 403;
    }
};

module.exports = {
    authenticateAccessToken,
    authenticateRefreshToken,
};