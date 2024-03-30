const feedbackManager = require('./feedbackManager');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config.json').authentication;

function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }
    // Simulated list of revoked tokens for demonstration
    const revokedTokens = ['revokedToken123'];
    if (revokedTokens.includes(token)) {
        return res.status(401).send({ message: 'Unauthorized: Token revoked' });
    }

    // Gather feedback for authentication process
    feedbackManager.gatherFeedback('Placeholder feedback message for authentication process.');

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }

        // Check if the token is close to expiration and refresh it
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp - currentTime < 300) { // Less than 5 minutes to expire
            const newToken = jwt.sign({ id: decoded.id }, secretKey, { expiresIn: '1h' });
            res.setHeader('x-refresh-token', newToken);
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
