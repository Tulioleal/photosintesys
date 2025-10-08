import {
  validateBase64Image,
  sanitizeString,
  validateImageFile,
  UserActionLimiter
} from '../lib/security';

describe('Security Utilities', () => {
  describe('validateBase64Image', () => {
    it('should validate correct base64 image', () => {
      const validBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ';
      const result = validateBase64Image(validBase64);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid base64 image', () => {
      const invalidBase64 = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
      const result = validateBase64Image(invalidBase64);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid image format');
    });

    it('should reject oversized base64 image', () => {
      const largeBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(20 * 1024 * 1024); // ~20MB
      const result = validateBase64Image(largeBase64);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Image too large');
    });
  });

  describe('sanitizeString', () => {
    it('should sanitize string and limit length', () => {
      const input = '<script>alert("xss")</script>Very long string that should be truncated';
      const result = sanitizeString(input, 20);
      expect(result).toBe('scriptalert(xss)/scr');
      expect(result.length).toBe(20);
    });

    it('should handle empty input', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(null as unknown as string)).toBe('');
    });
  });

  describe('validateImageFile', () => {
    it('should validate correct image file', () => {
      const mockFile = {
        size: 1024 * 1024, // 1MB
        type: 'image/jpeg',
        name: 'test.jpg'
      } as File;

      const result = validateImageFile(mockFile);
      expect(result.valid).toBe(true);
    });

    it('should reject oversized file', () => {
      const mockFile = {
        size: 20 * 1024 * 1024, // 20MB
        type: 'image/jpeg',
        name: 'large.jpg'
      } as File;

      const result = validateImageFile(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size too large');
    });

    it('should reject invalid file type', () => {
      const mockFile = {
        size: 1024,
        type: 'text/plain',
        name: 'test.txt'
      } as File;

      const result = validateImageFile(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });
  });

  describe('UserActionLimiter', () => {
    beforeEach(() => {
      // Reset the limiter state
      (UserActionLimiter as unknown as { actions: Map<string, number[]> }).actions.clear();
    });

    it('should allow actions within limit', () => {
      const user_id = 'user1';
      const action = 'test_action';

      expect(UserActionLimiter.canPerformAction(user_id, action, 2, 1000)).toBe(true);
      expect(UserActionLimiter.canPerformAction(user_id, action, 2, 1000)).toBe(true);
    });

    it('should block actions over limit', () => {
      const user_id = 'user1';
      const action = 'test_action';

      UserActionLimiter.canPerformAction(user_id, action, 1, 1000);
      expect(UserActionLimiter.canPerformAction(user_id, action, 1, 1000)).toBe(false);
    });
  });
});