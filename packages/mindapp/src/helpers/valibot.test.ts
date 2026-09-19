import * as v from 'valibot';
import { describe, expect, it } from 'vitest';

import { deepPartial, type DeepPartial } from './valibot';

describe('#01 => helpers/valibot', () => {
  describe('#01 => deepPartial schema', () => {
    it('#01 => should make object properties deeply optional', () => {
      const userSchema = v.object({
        id: v.string(),
        profile: v.object({ name: v.string(), age: v.number() }),
      });

      const partialSchema = deepPartial(userSchema);

      // Empty object should be valid
      const emptyResult = v.safeParse(partialSchema, {});
      expect(emptyResult.success).toBe(true);

      // Partially filled nested object should be valid
      const nestedResult = v.safeParse(partialSchema, {
        profile: { name: 'Alice' },
      });
      expect(nestedResult.success).toBe(true);

      // Invalid inner type should still fail
      const invalidResult = v.safeParse(partialSchema, {
        profile: { age: 'not-a-number' },
      });
      expect(invalidResult.success).toBe(false);
    });

    it('#02 => should handle array schemas recursively', () => {
      const listSchema = v.array(
        v.object({ title: v.string(), tags: v.array(v.string()) }),
      );

      const partialList = deepPartial(listSchema);

      const result = v.safeParse(partialList, [
        { title: 'Item 1' },
        { tags: ['a', 'b'] },
        {},
      ]);
      expect(result.success).toBe(true);
    });

    it('#03 => should leave primitive schemas unchanged', () => {
      const strSchema = v.string();
      expect(deepPartial(strSchema)).toBe(strSchema);

      const numSchema = v.number();
      expect(deepPartial(numSchema)).toBe(numSchema);
    });
  });

  describe('#02 => DeepPartial type', () => {
    it('#01 => should compile with partial nested objects', () => {
      type Person = {
        name: string;
        details: { age: number; address: { city: string } };
      };

      const partialPerson: DeepPartial<Person> = { details: { address: {} } };

      expect(partialPerson.details?.address).toBeDefined();
    });
  });
});
