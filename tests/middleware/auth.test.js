const jwt = require('jsonwebtoken');
const { verifyToken, checkPermissions } = require('../../middleware/auth');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), send: jest.fn(), setHeader: jest.fn() };
    next = jest.fn();
  });

  describe('verifyToken', () => {
    it('successfully authenticates with valid token', () => {
      req.headers['authorization'] = 'Bearer validToken';
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { id: 'userId', exp: Math.floor(Date.now() / 1000) + 3600 }));

      verifyToken(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('refreshes token when close to expiration', () => {
      req.headers['authorization'] = 'Bearer expiringToken';
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { id: 'userId', exp: Math.floor(Date.now() / 1000) + 299 }));

      verifyToken(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('x-refresh-token', expect.any(String));
      expect(next).toHaveBeenCalled();
    });

    it('responds with 403 if no token is provided', () => {
      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ message: 'No token provided!' });
    });

    it('responds with 401 if token is revoked', () => {
      req.headers['authorization'] = 'Bearer revokedToken123';
      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: 'Unauthorized: Token revoked' });
    });
  });

  describe('checkPermissions', () => {
    it('allows request with sufficient permissions', () => {
      req.user = { permissions: ['read', 'write'] };
      const middleware = checkPermissions(['read']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('blocks request with insufficient permissions', () => {
      req.user = { permissions: ['read'] };
      const middleware = checkPermissions(['read', 'write']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ message: 'Forbidden: Insufficient permissions' });
    });
  });
});
