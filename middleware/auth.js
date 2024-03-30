const feedbackManager = require('./feedbackManager');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config.json').authentication;

/**
 * Middleware to verify JWT tokens in incoming requests.
 * Features include:
 * - Verification of the token's validity
 * - Handling revoked tokens
 * - Refreshing tokens close to expiration
 * - Gathering feedback on the authentication process
 * @param {Object} req - The request object from Express.js.
 * @param {Object} res - The response object from Express.js.
 * @param {Function} next - The next middleware function in the stack.
 */
function hasPermission(userPermissions, requiredPermissions) {
    return requiredPermissions.every(rp => userPermissions.includes(rp));
}

function verifyToken(req, res, next) {
    // Extract the token from the Authorization header
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        feedbackManager.gatherFeedback('No authentication token provided.');
        return res.status(403).send({ message: 'Access Denied: No authentication token provided.' });
    }
    
    // Check if the token is in the list of revoked tokens
    const revokedTokens = ['revokedToken123']; // Example list of revoked tokens
    if (revokedTokens.includes(token)) {
        feedbackManager.gatherFeedback('Attempt to use a revoked token.');
        return res.status(401).send({ message: 'Unauthorized: The provided token has been revoked.' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            feedbackManager.gatherFeedback('Failed to authenticate token.');
            return res.status(401).send({ message: 'Unauthorized: Failed to authenticate token.' });
        } else {
            if (req.path.startsWith('/protected-route')) {
                const requiredPermissions = ['read', 'write']; // Example permissions, adjust as necessary
                if (!hasPermission(decoded.permissions, requiredPermissions)) {
                    return res.status(403).send({ message: 'Forbidden: Insufficient permissions.' });
                }
            }
        }

        // If the token is close to expiration, issue a new one
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp - currentTime < 300) { // If less than 5 minutes to expiration
            const newToken = jwt.sign({ id: decoded.id }, secretKey, { expiresIn: '1h' });
            res.setHeader('x-refresh-token', newToken);
            feedbackManager.gatherFeedback('Token refreshed due to impending expiration.');
        }

        req.userId = decoded.id; // Attach the user ID from the token to the request object
        next();
    });
}

/**
 * Middleware factory to create a middleware that checks if the user has the required permissions.
 * @param {Array<string>} requiredPermissions - The permissions required to perform the action.
 * @returns {Function} - The middleware function that checks permissions.
 */
function checkPermissions(requiredPermissions) {
    return (req, res, next) => {
        // Example: req.user.permissions might be filled by an earlier auth middleware
        const { permissions } = req.user;

        const hasPermission = requiredPermissions.every(rp => permissions.includes(rp));
        if (!hasPermission) {
            feedbackManager.gatherFeedback('Insufficient permissions for action.');
            return res.status(403).send({ message: 'Forbidden: Insufficient permissions.' });
        }
        next();
    };
}

module.exports = { verifyToken, checkPermissions };