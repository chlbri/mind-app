import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { timestamps } from './timestamps';

describe('timestamps schema', () => {
  describe('#01 => Basic schema with timestamps', () => {
    it('#01 => should create a valid timestamps schema', () => {
      const schema = v.object({
        name: v.string(),
        description: v.string(),
      });

      const result = timestamps(schema);

      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });

    it('#02 => should accept valid data with timestamps metadata', () => {
      const schema = v.object({ title: v.string(), content: v.string() });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        title: 'Test',
        content: 'Test content',
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const data2 = {
        title: 'Test',
        content: 'Test content',
        __timestamps: {},
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);

      const result2 = v.safeParse(timestamped, data2);
      expect(result2.success).toBe(true);
    });

    it('#03 => should not reject data without __timestamps', () => {
      const schema = v.object({ name: v.string() });

      const timestamped = timestamps(schema);

      const data = { name: 'Test' };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output).toEqual({
          name: 'Test',
          __timestamps: {
            createdAt: expect.anything(),
            updatedsAt: [],
            deletedsAt: [],
            restoredsAt: [],
          },
        });

        const actual = result.output.__timestamps.createdAt.getTime();
        expect(actual).closeTo(Date.now(), 1000); // within 1 second
      }
    });
  });

  describe('#02 => CreatedAt field validation', () => {
    it('#01 => should accept valid createdAt date', () => {
      const schema = v.object({ id: v.string() });

      const timestamped = timestamps(schema);
      const createdDate = new Date('2024-01-01');

      const data = {
        id: 'test-1',
        __timestamps: {
          createdAt: createdDate,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#02 => should use current date as default for createdAt', () => {
      const schema = v.object({ label: v.string() });

      const timestamped = timestamps(schema);

      const data = {
        label: 'Test Label',
        __timestamps: { updatedsAt: [], deletedsAt: [], restoredsAt: [] },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#03 => should reject invalid createdAt value', () => {
      const schema = v.object({ name: v.string() });

      const timestamped = timestamps(schema);

      const data = {
        name: 'Test',
        __timestamps: {
          createdAt: 'not-a-date',
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(false);
    });
  });

  describe('#03 => UpdatedAt array validation', () => {
    it('#01 => should accept empty updatedsAt array', () => {
      const schema = v.object({ content: v.string() });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        content: 'Test',
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#02 => should accept valid updatedsAt with dates after createdAt', () => {
      const schema = v.object({ value: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-01');
      const updatedAt1 = new Map([
        [new Date('2024-01-02'), { value: 'update1' }],
      ]);
      const updatedAt2 = new Map([
        [new Date('2024-01-03'), { value: 'update2' }],
      ]);

      const data = {
        value: 'test',
        __timestamps: {
          createdAt,
          updatedsAt: [updatedAt1, updatedAt2],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#03 => should reject updatedsAt with date before createdAt', () => {
      const schema = v.object({ data: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-05');
      const updatedAt = new Date('2024-01-01');

      const data = {
        data: 'test',
        __timestamps: {
          createdAt,
          updatedsAt: [updatedAt],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(false);
    });

    it('#04 => should use empty array as default for updatedsAt', () => {
      const schema = v.object({ name: v.string() });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        name: 'Test',
        __timestamps: { createdAt: now, deletedsAt: [], restoredsAt: [] },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#05 => should reject invalid date in updatedsAt array', () => {
      const schema = v.object({ title: v.string() });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        title: 'Test',
        __timestamps: {
          createdAt: now,
          updatedsAt: ['invalid-date'],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(false);
    });
  });

  describe('#04 => DeletedAt array validation', () => {
    it('#01 => should accept empty deletedsAt array', () => {
      const schema = v.object({ text: v.string() });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        text: 'Test',
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#02 => should accept valid deletedsAt after createdAt', () => {
      const schema = v.object({ item: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-01');
      const deletedAt = new Date('2024-01-10');

      const data = {
        item: 'test',
        __timestamps: {
          createdAt,
          updatedsAt: [],
          deletedsAt: [deletedAt],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#03 => should reject deletedsAt before createdAt', () => {
      const schema = v.object({ item: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-05');
      const deletedAt = new Date('2024-01-01');

      const data = {
        item: 'test',
        __timestamps: {
          createdAt,
          updatedsAt: [],
          deletedsAt: [deletedAt],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(false);
    });

    it('#04 => should use empty array as default for deletedsAt', () => {
      const schema = v.object({ name: v.string() });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        name: 'Test',
        __timestamps: { createdAt: now, updatedsAt: [], restoredsAt: [] },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#05 => should accept multiple deletion dates', () => {
      const schema = v.object({ item: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-01');
      const deletedAt1 = new Date('2024-01-05');
      const deletedAt2 = new Date('2024-01-10');

      const data = {
        item: 'test',
        __timestamps: {
          createdAt,
          updatedsAt: [],
          deletedsAt: [deletedAt1, deletedAt2],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });
  });

  describe('#05 => RestoredAt array validation', () => {
    it('#01 => should accept empty restoredsAt array', () => {
      const schema = v.object({ name: v.string() });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        name: 'Test',
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#02 => should accept restoredAt after createdAt', () => {
      const schema = v.object({ value: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-01');
      const restoredAt = new Date('2024-01-15');

      const data = {
        value: 'test',
        __timestamps: {
          createdAt,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [restoredAt],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#03 => should reject restoredAt before createdAt', () => {
      const schema = v.object({ value: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-10');
      const restoredAt = new Date('2024-01-01');

      const data = {
        value: 'test',
        __timestamps: {
          createdAt,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [restoredAt],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(false);
    });

    it('#04 => should use empty array as default for restoredsAt', () => {
      const schema = v.object({ name: v.string() });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        name: 'Test',
        __timestamps: { createdAt: now, updatedsAt: [], deletedsAt: [] },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });
  });

  describe('#06 => Complex timestamp relationships', () => {
    it('#01 => should validate restoration after deletion', () => {
      const schema = v.object({ id: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-01');
      const deletedAt = new Date('2024-01-05');
      const restoredAt = new Date('2024-01-10');

      const data = {
        id: 'test-1',
        __timestamps: {
          createdAt,
          updatedsAt: [],
          deletedsAt: [deletedAt],
          restoredsAt: [restoredAt],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#02 => should reject restoration before deletion', () => {
      const schema = v.object({ id: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-01');
      const deletedAt = new Date('2024-01-10');
      const restoredAt = new Date('2024-01-05');

      const data = {
        id: 'test-1',
        __timestamps: {
          createdAt,
          updatedsAt: [],
          deletedsAt: [deletedAt],
          restoredsAt: [restoredAt],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(false);
    });

    it('#03 => should handle multiple updates before deletion', () => {
      const schema = v.object({ name: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-01');
      const updatedAt1 = new Map([
        [new Date('2024-01-02'), { name: 'update1' }],
      ]);
      const updatedAt2 = new Map([
        [new Date('2024-01-03'), { name: 'update2' }],
      ]);
      const deletedAt = new Date('2024-01-10');

      const data = {
        name: 'Test',
        __timestamps: {
          createdAt,
          updatedsAt: [updatedAt1, updatedAt2],
          deletedsAt: [deletedAt],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#04 => should handle full lifecycle', () => {
      const schema = v.object({ name: v.string() });

      const timestamped = timestamps(schema);
      const createdAt = new Date('2024-01-01');
      const updatedAt1 = new Map([
        [new Date('2024-01-02'), { name: 'update1' }],
      ]);
      const updatedAt2 = new Map([
        [new Date('2024-01-04'), { name: 'update2' }],
      ]);
      const deletedAt = new Date('2024-01-10');
      const restoredAt = new Date('2024-01-15');

      const data = {
        name: 'Test',
        __timestamps: {
          createdAt,
          updatedsAt: [updatedAt1, updatedAt2],
          deletedsAt: [deletedAt],
          restoredsAt: [restoredAt],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });
  });

  describe('#07 => Nested schema with timestamps', () => {
    it('#01 => should work with nested object schema', () => {
      const schema = v.object({
        name: v.string(),
        email: v.pipe(v.string(), v.email()),
      });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#02 => should validate schema with optional fields', () => {
      const schema = v.object({
        firstName: v.string(),
        lastName: v.string(),
        bio: v.optional(v.string()),
      });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        firstName: 'Jane',
        lastName: 'Doe',
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#03 => should reject schema with invalid required field', () => {
      const schema = v.object({
        timeout: v.number(),
        retries: v.number(),
      });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        timeout: 'not-a-number',
        retries: 3,
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(false);
    });
  });

  describe('#08 => Edge cases and error handling', () => {
    it('#01 => should handle simple schemas', () => {
      const schema = v.object({ host: v.string(), port: v.number() });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        host: 'localhost',
        port: 5432,
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#02 => should handle schemas with multiple top-level fields', () => {
      const schema = v.object({
        id: v.string(),
        name: v.string(),
        email: v.pipe(v.string(), v.email()),
        active: v.boolean(),
      });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        active: true,
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#03 => should maintain original schema validation constraints', () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email()),
        age: v.pipe(v.number(), v.minValue(0), v.maxValue(150)),
      });

      const timestamped = timestamps(schema);
      const now = new Date();

      const invalidData = {
        email: 'invalid-email',
        age: 200,
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, invalidData);
      expect(result.success).toBe(false);
    });

    it('#04 => should accept all optional timestamp fields as undefined', () => {
      const schema = v.object({ name: v.string() });

      const timestamped = timestamps(schema);

      const data = { name: 'Test', __timestamps: {} };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });
  });

  describe('#09 => Real-world scenarios', () => {
    it('#01 => should validate simple user record', () => {
      const schema = v.object({
        userId: v.string(),
        username: v.string(),
      });

      const timestamped = timestamps(schema);
      const created = new Date('2024-01-01');

      const data = {
        userId: 'user-123',
        username: 'johndoe',
        __timestamps: {
          createdAt: created,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#02 => should validate API request record', () => {
      const schema = v.object({
        method: v.string(),
        url: v.string(),
        statusCode: v.number(),
      });

      const timestamped = timestamps(schema);
      const now = new Date();

      const data = {
        method: 'GET',
        url: '/api/users',
        statusCode: 200,
        __timestamps: {
          createdAt: now,
          updatedsAt: [],
          deletedsAt: [],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });

    it('#03 => should validate soft-delete scenario', () => {
      const schema = v.object({
        id: v.string(),
        title: v.string(),
        content: v.string(),
      });

      const timestamped = timestamps(schema);
      const created = new Date('2024-01-01');
      const deleted = new Date('2024-01-10');

      const data = {
        id: 'post-1',
        title: 'My Post',
        content: 'Post content',
        __timestamps: {
          createdAt: created,
          updatedsAt: [],
          deletedsAt: [deleted],
          restoredsAt: [],
        },
      };

      const result = v.safeParse(timestamped, data);
      expect(result.success).toBe(true);
    });
  });
});
