const errorHandler = require('../middleware/errorHandler');
const logger = require('../logger');
const feedbackManager = require('../middleware/feedbackManager');
const { ApplicationError } = require('../middleware/customErrors');
const httpMocks = require('node-mocks-http');

jest.mock('../logger');
jest.mock('../middleware/feedbackManager');

describe('errorHandler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it('handles operational errors correctly', () => {
    const operationalError = new ApplicationError('Operational error occurred', 400);
    errorHandler(operationalError, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Operational error occurred'));
    expect(feedbackManager.gatherFeedback).toHaveBeenCalledWith(expect.stringContaining('Operational error occurred'));
    expect(res.statusCode).toBe(400);
    expect(res._getData()).toEqual(expect.objectContaining({
      success: false,
      message: 'Operational error occurred',
    }));
  });

  it('handles unexpected errors correctly', () => {
    const unexpectedError = new Error('Unexpected error occurred');
    errorHandler(unexpectedError, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Unexpected error occurred'));
    expect(feedbackManager.gatherFeedback).toHaveBeenCalledWith(expect.stringContaining('Error handled: Unexpected error occurred'));
    expect(res.statusCode).toBe(500);
    expect(res._getData()).toEqual(expect.objectContaining({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    }));
  });
});
