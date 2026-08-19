import * as v from 'valibot';
import { expectTypeOf } from 'vitest';

import type { DecomposedOutput, DotPaths } from './types';

describe('DecomposedOutput type tests', () => {
  it('should create output for flat object schema', () => {
    const schema = v.object({ name: v.string(), age: v.number() });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output>().toEqualTypeOf<{
      name: v.OptionalSchema<v.StringSchema<undefined>, undefined>;
      age: v.OptionalSchema<v.NumberSchema<undefined>, undefined>;
    }>();
  });

  it('should create output with dot notation for nested object', () => {
    const schema = v.object({
      user: v.object({ name: v.string(), email: v.string() }),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output>().toHaveProperty('user.name');
    expectTypeOf<Output>().toHaveProperty('user.email');
    expectTypeOf<Output['user.name']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['user.email']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
  });

  it('should handle deeply nested object (3 levels)', () => {
    const schema = v.object({
      company: v.object({
        address: v.object({ city: v.string(), zipcode: v.number() }),
      }),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output>().toHaveProperty('company.address.city');
    expectTypeOf<Output>().toHaveProperty('company.address.zipcode');
    expectTypeOf<Output['company.address.city']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['company.address.zipcode']>().toEqualTypeOf<
      v.OptionalSchema<v.NumberSchema<undefined>, undefined>
    >();
  });

  it('should handle very deep nesting (5 levels)', () => {
    const schema = v.object({
      level1: v.object({
        level2: v.object({
          level3: v.object({
            level4: v.object({ level5: v.object({ value: v.string() }) }),
          }),
        }),
      }),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output>().toHaveProperty(
      'level1.level2.level3.level4.level5.value',
    );
    expectTypeOf<Output['level1.level2.level3.level4.level5.value']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
  });

  it('should include both flat and nested keys', () => {
    const schema = v.object({
      id: v.number(),
      user: v.object({ name: v.string(), profile: v.object({ bio: v.string() }) }),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output>().toHaveProperty('id');
    expectTypeOf<Output>().toHaveProperty('user.name');
    expectTypeOf<Output>().toHaveProperty('user.profile.bio');
    expectTypeOf<Output['id']>().toEqualTypeOf<
      v.OptionalSchema<v.NumberSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['user.name']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['user.profile.bio']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
  });

  it('should handle multiple nested objects at same level', () => {
    const schema = v.object({
      account: v.object({ email: v.string(), username: v.string() }),
      settings: v.object({ theme: v.string(), language: v.string() }),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output>().toHaveProperty('account.email');
    expectTypeOf<Output>().toHaveProperty('account.username');
    expectTypeOf<Output>().toHaveProperty('settings.theme');
    expectTypeOf<Output>().toHaveProperty('settings.language');
  });

  it('should preserve boolean types', () => {
    const schema = v.object({
      user: v.object({ active: v.boolean(), verified: v.boolean() }),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output['user.active']>().toEqualTypeOf<
      v.OptionalSchema<v.BooleanSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['user.verified']>().toEqualTypeOf<
      v.OptionalSchema<v.BooleanSchema<undefined>, undefined>
    >();
  });

  it('should preserve all primitive types', () => {
    const schema = v.object({
      config: v.object({
        stringVal: v.string(),
        numberVal: v.number(),
        boolVal: v.boolean(),
      }),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output['config.stringVal']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['config.numberVal']>().toEqualTypeOf<
      v.OptionalSchema<v.NumberSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['config.boolVal']>().toEqualTypeOf<
      v.OptionalSchema<v.BooleanSchema<undefined>, undefined>
    >();
  });

  it('should handle optional wrapped schemas', () => {
    const schema = v.object({ user: v.optional(v.object({ name: v.string() })) });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output>().toHaveProperty('user.name');
    expectTypeOf<Output['user.name']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
  });

  it('should handle nullable wrapped schemas', () => {
    const schema = v.object({ user: v.nullable(v.object({ email: v.string() })) });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output>().toHaveProperty('user.email');
    expectTypeOf<Output['user.email']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
  });

  it('should work with piped schemas', () => {
    const schema = v.object({
      contact: v.object({ email: v.pipe(v.string(), v.email()) }),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output['contact.email']>().toEqualTypeOf<
      v.OptionalSchema<
        v.SchemaWithPipe<
          readonly [v.StringSchema<undefined>, v.EmailAction<string, undefined>]
        >,
        undefined
      >
    >();
  });

  it('should generate correct DotPaths for complex schema', () => {
    const schema = v.object({
      api: v.object({
        v1: v.object({
          endpoints: v.object({ users: v.string(), posts: v.string() }),
        }),
      }),
    });

    type Paths = DotPaths<typeof schema.entries>;

    expectTypeOf<Paths>().toEqualTypeOf<
      | 'api'
      | 'api.v1'
      | 'api.v1.endpoints'
      | 'api.v1.endpoints.users'
      | 'api.v1.endpoints.posts'
    >();
  });

  it('should have all paths as keys in DecomposedOutput', () => {
    const schema = v.object({
      system: v.object({ config: v.object({ debug: v.boolean() }) }),
    });

    type Output = DecomposedOutput<typeof schema.entries>;
    type Paths = DotPaths<typeof schema.entries>;

    // Every path should exist in Output
    type SystemPath = Extract<Paths, 'system'>;
    type SystemConfigPath = Extract<Paths, 'system.config'>;
    type SystemConfigDebugPath = Extract<Paths, 'system.config.debug'>;

    expectTypeOf<Output>().toHaveProperty('system');
    expectTypeOf<Output>().toHaveProperty('system.config');
    expectTypeOf<Output>().toHaveProperty('system.config.debug');
  });

  it('should handle schema with mixed required and optional nested objects', () => {
    const schema = v.object({
      required: v.object({ id: v.number() }),
      optional: v.optional(v.object({ name: v.string() })),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output['required.id']>().toEqualTypeOf<
      v.OptionalSchema<v.NumberSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['optional.name']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
  });

  it('should maintain type accuracy through deeply nested optional', () => {
    const schema = v.object({
      data: v.optional(
        v.object({ nested: v.optional(v.object({ value: v.number() })) }),
      ),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output['data.nested.value']>().toEqualTypeOf<
      v.OptionalSchema<v.NumberSchema<undefined>, undefined>
    >();
  });

  it('should work with empty nested object', () => {
    const schema = v.object({ empty: v.object({}) });

    type Output = DecomposedOutput<typeof schema.entries>;

    // Should not have any properties from empty
    expectTypeOf<Output>().not.toHaveProperty('empty.something');
    expectTypeOf<Output>().toEqualTypeOf<{
      empty: v.OptionalSchema<v.ObjectSchema<{}, undefined>, undefined>;
    }>();
  });

  it('should correctly type schema with array-like but object structure', () => {
    const schema = v.object({
      endpoints: v.object({
        get: v.string(),
        post: v.string(),
        put: v.string(),
        delete: v.string(),
      }),
    });

    type Output = DecomposedOutput<typeof schema.entries>;

    expectTypeOf<Output['endpoints.get']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['endpoints.post']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['endpoints.put']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
    expectTypeOf<Output['endpoints.delete']>().toEqualTypeOf<
      v.OptionalSchema<v.StringSchema<undefined>, undefined>
    >();
  });
});
