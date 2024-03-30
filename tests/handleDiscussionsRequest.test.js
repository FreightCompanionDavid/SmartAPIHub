const { createDiscussion, getDiscussions } = require('../handleDiscussionsRequest');
const logger = require('../logger');
jest.mock('../logger');

describe('handleDiscussionsRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetModules();
  });

  describe('createDiscussion', () => {
    it('successfully creates a discussion', () => {
      const content = 'Test discussion content';
      const author = 'Test Author';
      const discussion = createDiscussion(content, author);

      expect(discussion).toHaveProperty('content', content);
      expect(discussion).toHaveProperty('author', author);
      expect(discussion).toHaveProperty('timestamp');
      expect(new Date(discussion.timestamp).toISOString()).toBe(discussion.timestamp);
      expect(new Date() - new Date(discussion.timestamp)).toBeLessThan(1000);
    });

    it('handles error during discussion creation', () => {
      logger.error.mockImplementation(() => {
        throw new Error('Failed to create discussion');
      });

      expect(() => createDiscussion('Test content', 'Test Author')).toThrow('Failed to create discussion');
    });
  });

  describe('getDiscussions', () => {
    it('retrieves discussions successfully', () => {
      const discussion1 = createDiscussion('Content 1', 'Author 1');
      const discussion2 = createDiscussion('Content 2', 'Author 2');

      const discussions = getDiscussions();

      expect(discussions).toContainEqual(discussion1);
      expect(discussions).toContainEqual(discussion2);
    });

    it('returns an empty array when no discussions are present', () => {
      jest.resetModules(); // Reset the module to clear existing discussions
      const discussions = getDiscussions();

      expect(discussions).toEqual([]);
    });

    it('handles error during discussions retrieval', () => {
      logger.error.mockImplementation(() => {
        throw new Error('Failed to retrieve discussions');
      });

      expect(() => getDiscussions()).toThrow('Failed to retrieve discussions');
    });
  });
});
