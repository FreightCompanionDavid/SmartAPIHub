const jwt = require('jsonwebtoken');
const { secretKey } = require('../config.json').authentication;

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        next();
    });
}

function checkPermissions(requiredPermissions) {
    return (req, res, next) => {
        const { permissions } = req.user;
        const hasPermission = requiredPermissions.every(rp => permissions.includes(rp));
        if (!hasPermission) {
            return res.status(403).send({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
}

module.exports = { verifyToken, checkPermissions };
