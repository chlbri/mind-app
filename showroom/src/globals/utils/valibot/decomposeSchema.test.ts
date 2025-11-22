import * as v from 'valibot';
import { decomposeSchema } from './decomposeSchema';

describe('#01 => decomposeSchema', () => {
  describe('#01 => Simple object schema', () => {
    it('#01 => should decompose a simple flat object schema', () => {
      const schema = v.object({
        name: v.string(),
        age: v.number(),
        email: v.string(),
      });

      const result = decomposeSchema(schema);

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(result.entries).toHaveProperty('name');
      expect(result.entries).toHaveProperty('age');
      expect(result.entries).toHaveProperty('email');
    });

    it('#02 => should keep schema references for primitive types', () => {
      const schema = v.object({
        name: v.string(),
        active: v.boolean(),
      });

      const result = decomposeSchema(schema);

      expect(result.entries.name).toBeDefined();
      expect(result.entries.active).toBeDefined();
      // Verify they are valibot schemas
      expect(result.entries.name.type).toBeDefined();
      expect(result.entries.active.type).toBeDefined();
    });
  });

  describe('#02 => Nested object schema', () => {
    it('#01 => should decompose nested object schemas with dot notation', () => {
      const schema = v.object({
        user: v.object({
          name: v.string(),
          email: v.string(),
        }),
        settings: v.object({
          theme: v.string(),
          notifications: v.boolean(),
        }),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty('user.name');
      expect(entries).toHaveProperty('user.email');
      expect(entries).toHaveProperty('settings.theme');
      expect(entries).toHaveProperty('settings.notifications');
    });

    it('#02 => should handle deeply nested objects', () => {
      const schema = v.object({
        company: v.object({
          address: v.object({
            street: v.string(),
            city: v.string(),
            coordinates: v.object({
              latitude: v.number(),
              longitude: v.number(),
            }),
          }),
        }),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty('company.address.street');
      expect(entries).toHaveProperty('company.address.city');
      expect(entries).toHaveProperty(
        'company.address.coordinates.latitude',
      );
      expect(entries).toHaveProperty(
        'company.address.coordinates.longitude',
      );
    });

    it('#03 => should return all fields at each level of nesting', () => {
      const schema = v.object({
        topLevel: v.string(),
        nested: v.object({
          nestedLevel: v.number(),
          deepNested: v.object({
            deepLevel: v.boolean(),
          }),
        }),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty('topLevel');
      expect(entries).toHaveProperty('nested.nestedLevel');
      expect(entries).toHaveProperty('nested.deepNested.deepLevel');
    });
  });

  describe('#03 => Mixed schemas with pipes and modifications', () => {
    it('#01 => should handle schemas with pipes', () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email()),
        password: v.pipe(v.string(), v.minLength(8)),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty('email');
      expect(entries).toHaveProperty('password');
    });

    it('#02 => should handle optional fields', () => {
      const schema = v.object({
        name: v.string(),
        middleName: v.optional(v.string()),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty('name');
      expect(entries).toHaveProperty('middleName');
    });

    it('#03 => should handle nullable fields', () => {
      const schema = v.object({
        name: v.string(),
        nickname: v.nullable(v.string()),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty('name');
      expect(entries).toHaveProperty('nickname');
    });
  });

  describe('#04 => Complex nested structures', () => {
    it('#01 => should handle mixed optional and required nested fields', () => {
      const schema = v.object({
        user: v.object({
          name: v.string(),
          profile: v.optional(
            v.object({
              bio: v.string(),
              avatar: v.string(),
            }),
          ),
        }),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty('user.name');
      expect(entries).toHaveProperty('user.profile.bio');
      expect(entries).toHaveProperty('user.profile.avatar');
    });

    it('#02 => should handle multiple levels with various field types', () => {
      const schema = v.object({
        id: v.number(),
        metadata: v.object({
          createdAt: v.pipe(v.string(), v.isoTimestamp()),
          updatedAt: v.optional(v.pipe(v.string(), v.isoTimestamp())),
          tags: v.object({
            primary: v.string(),
            secondary: v.optional(v.string()),
          }),
        }),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty('id');
      expect(entries).toHaveProperty('metadata.createdAt');
      expect(entries).toHaveProperty('metadata.updatedAt');
      expect(entries).toHaveProperty('metadata.tags.primary');
      expect(entries).toHaveProperty('metadata.tags.secondary');
    });
  });

  describe('#05 => Return type validation', () => {
    it('#01 => should return a valibot ObjectSchema', () => {
      const schema = v.object({
        name: v.string(),
      });

      const result = decomposeSchema(schema);

      expect(result).toBeDefined();
      expect(result.type).toBe('strict_object');
    });

    it('#02 => returned schema should be usable for validation', () => {
      const schema = v.object({
        user: v.object({
          name: v.string(),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Test that the decomposed schema is a valid valibot schema
      // Since all fields are optional, empty object should pass
      const result = v.safeParse(decomposed, {});
      expect(result.success).toBe(true);
    });
  });

  describe('#06 => Edge cases', () => {
    it('#01 => should handle empty object schema', () => {
      const schema = v.object({});

      const result = decomposeSchema(schema);

      expect(result).toBeDefined();
      expect(Object.keys(result.entries)).toHaveLength(0);
    });

    it('#02 => should handle object with only nested empty object', () => {
      const schema = v.object({
        nested: v.object({}),
      });

      const result = decomposeSchema(schema);

      expect(result).toBeDefined();
    });

    it('#03 => should make all fields optional in decomposed schema', () => {
      const schema = v.object({
        name: v.string(),
        age: v.number(),
      });

      const result = decomposeSchema(schema);
      const parsed = v.safeParse(result, {});

      expect(parsed.success).toBe(true);
    });
  });

  describe('#07 => Real world examples', () => {
    it('#01 => should decompose a user registration schema', () => {
      const schema = v.object({
        account: v.object({
          username: v.string(),
          email: v.pipe(v.string(), v.email()),
          password: v.pipe(v.string(), v.minLength(8)),
        }),
        profile: v.object({
          firstName: v.string(),
          lastName: v.string(),
          avatar: v.optional(v.string()),
        }),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty('account.username');
      expect(entries).toHaveProperty('account.email');
      expect(entries).toHaveProperty('account.password');
      expect(entries).toHaveProperty('profile.firstName');
      expect(entries).toHaveProperty('profile.lastName');
      expect(entries).toHaveProperty('profile.avatar');
    });

    it('#02 => should decompose a configuration schema', () => {
      const schema = v.object({
        server: v.object({
          host: v.string(),
          port: v.number(),
          ssl: v.object({
            enabled: v.boolean(),
            cert: v.optional(v.string()),
          }),
        }),
        database: v.object({
          url: v.string(),
          pool: v.object({
            min: v.number(),
            max: v.number(),
          }),
        }),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty('server.host');
      expect(entries).toHaveProperty('server.port');
      expect(entries).toHaveProperty('server.ssl.enabled');
      expect(entries).toHaveProperty('server.ssl.cert');
      expect(entries).toHaveProperty('database.url');
      expect(entries).toHaveProperty('database.pool.min');
      expect(entries).toHaveProperty('database.pool.max');
    });
  });

  describe('#08 => Deep nested schema with validation', () => {
    it('#01 => should decompose a very deep nested schema (5+ levels)', () => {
      const schema = v.object({
        level1: v.object({
          level2: v.object({
            level3: v.object({
              level4: v.object({
                level5: v.object({
                  value: v.string(),
                  count: v.number(),
                }),
              }),
            }),
          }),
        }),
      });

      const result = decomposeSchema(schema);
      const entries = result.entries;

      expect(entries).toHaveProperty(
        'level1.level2.level3.level4.level5.value',
      );
      expect(entries).toHaveProperty(
        'level1.level2.level3.level4.level5.count',
      );
    });

    it('#02 => should validate with empty object on deeply nested schema', () => {
      const schema = v.object({
        company: v.object({
          department: v.object({
            team: v.object({
              members: v.object({
                name: v.string(),
                email: v.string(),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);
      const result = v.safeParse(decomposed, {});

      expect(result.success).toBe(true);
      expect(result.output).toEqual({});
    });

    it('#03 => should validate with partial data on deeply nested schema', () => {
      const schema = v.object({
        app: v.object({
          config: v.object({
            database: v.object({
              connection: v.object({
                host: v.string(),
                port: v.number(),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);
      const partialData = {
        'app.config.database.connection.host': 'localhost',
      };

      const result = v.safeParse(decomposed, partialData);
      expect(result.success).toBe(true);
    });

    it('#04 => should validate with complete nested data', () => {
      const schema = v.object({
        root: v.object({
          branch: v.object({
            leaf: v.object({
              data: v.string(),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);
      const completeData = {
        'root.branch.leaf.data': 'test-value',
      };

      const result = v.safeParse(decomposed, completeData);
      expect(result.success).toBe(true);
      expect(result.output).toEqual(completeData);
    });

    it('#05 => should handle deeply nested schema with mixed optional and required fields', () => {
      const schema = v.object({
        api: v.object({
          v1: v.object({
            endpoints: v.object({
              users: v.nullable(
                v.object({
                  get: v.string(),
                  post: v.string(),
                }),
              ),
              posts: v.object({
                get: v.string(),
                delete: v.nullable(v.string()),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // These should exist in decomposed schema
      expect(decomposed.entries).toBeDefined();

      // Should validate with empty object
      const emptyResult = v.safeParse(decomposed, {});
      expect(emptyResult.success).toBe(true);

      // Should validate with some data
      const partialResult = v.safeParse(decomposed, {
        'api.v1.endpoints.users.get': '/api/users',
      });
      expect(partialResult.success).toBe(true);
    });

    it('#06 => should decompose and validate complex real-world deeply nested schema', () => {
      const schema = v.object({
        system: v.object({
          monitoring: v.object({
            alerts: v.object({
              thresholds: v.object({
                cpu: v.object({
                  warning: v.number(),
                  critical: v.number(),
                }),
                memory: v.object({
                  warning: v.number(),
                  critical: v.number(),
                }),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Test 1: Empty object should pass
      const emptyValidation = v.safeParse(decomposed, {});
      expect(emptyValidation.success).toBe(true);

      // Test 2: Partial data should pass
      const partialValidation = v.safeParse(decomposed, {
        'system.monitoring.alerts.thresholds.cpu.warning': 80,
      });
      expect(partialValidation.success).toBe(true);

      // Test 3: Complete nested data should pass
      const completeValidation = v.safeParse(decomposed, {
        'system.monitoring.alerts.thresholds.cpu.warning': 80,
        'system.monitoring.alerts.thresholds.cpu.critical': 95,
        'system.monitoring.alerts.thresholds.memory.warning': 70,
        'system.monitoring.alerts.thresholds.memory.critical': 90,
      });
      expect(completeValidation.success).toBe(true);
      expect(completeValidation.output).toEqual({
        'system.monitoring.alerts.thresholds.cpu.warning': 80,
        'system.monitoring.alerts.thresholds.cpu.critical': 95,
        'system.monitoring.alerts.thresholds.memory.warning': 70,
        'system.monitoring.alerts.thresholds.memory.critical': 90,
      });
    });

    it('#07 => should validate deeply nested schema with type checking', () => {
      const schema = v.object({
        workspace: v.object({
          project: v.object({
            modules: v.object({
              auth: v.object({
                config: v.object({
                  jwt: v.object({
                    secret: v.string(),
                    expiresIn: v.number(),
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Valid data with correct types
      const validResult = v.safeParse(decomposed, {
        'workspace.project.modules.auth.config.jwt.secret':
          'my-secret-key',
        'workspace.project.modules.auth.config.jwt.expiresIn': 3600,
      });
      expect(validResult.success).toBe(true);

      // Invalid data with wrong type
      const invalidResult = v.safeParse(decomposed, {
        'workspace.project.modules.auth.config.jwt.secret':
          'my-secret-key',
        'workspace.project.modules.auth.config.jwt.expiresIn':
          'not-a-number',
      });
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('#09 => Deep nested schema with non-empty object validation and failures', () => {
    it('#01 => should validate non-empty nested object with all correct types', () => {
      const schema = v.object({
        database: v.object({
          primary: v.object({
            connection: v.object({
              host: v.string(),
              port: v.number(),
              credentials: v.object({
                username: v.string(),
                password: v.string(),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      const fullData = {
        'database.primary.connection.host': 'db.example.com',
        'database.primary.connection.port': 5432,
        'database.primary.connection.credentials.username': 'admin',
        'database.primary.connection.credentials.password': 'secret123',
      };

      const result = v.safeParse(decomposed, fullData);
      expect(result.success).toBe(true);
      expect(result.output).toEqual(fullData);
    });

    it('#02 => should fail validation when nested field has wrong type', () => {
      const schema = v.object({
        service: v.object({
          config: v.object({
            settings: v.object({
              timeout: v.number(),
              retries: v.number(),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      const invalidData = {
        'service.config.settings.timeout': 'not-a-number',
        'service.config.settings.retries': 3,
      };

      const result = v.safeParse(decomposed, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues).toBeDefined();
        expect(result.issues.length).toBeGreaterThan(0);
      }
    });

    it('#03 => should fail validation for multiple type mismatches in deep nesting', () => {
      const schema = v.object({
        api: v.object({
          server: v.object({
            http: v.object({
              config: v.object({
                port: v.number(),
                host: v.string(),
                ssl: v.boolean(),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      const invalidData = {
        'api.server.http.config.port': 'port-string',
        'api.server.http.config.host': 12345,
        'api.server.http.config.ssl': 'true',
      };

      const result = v.safeParse(decomposed, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('#04 => should handle deeply nested non-empty object with email validation', () => {
      const schema = v.object({
        users: v.object({
          list: v.object({
            items: v.object({
              user: v.object({
                contact: v.object({
                  email: v.pipe(v.string(), v.email()),
                }),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Valid email
      const validResult = v.safeParse(decomposed, {
        'users.list.items.user.contact.email': 'test@example.com',
      });
      expect(validResult.success).toBe(true);

      // Invalid email
      const invalidResult = v.safeParse(decomposed, {
        'users.list.items.user.contact.email': 'not-an-email',
      });
      expect(invalidResult.success).toBe(false);
    });

    it('#05 => should validate non-empty deeply nested object with length constraints', () => {
      const schema = v.object({
        organization: v.object({
          teams: v.object({
            engineering: v.object({
              members: v.object({
                lead: v.object({
                  name: v.pipe(v.string(), v.minLength(3)),
                }),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Valid: name with sufficient length
      const validResult = v.safeParse(decomposed, {
        'organization.teams.engineering.members.lead.name': 'Alexander',
      });
      expect(validResult.success).toBe(true);

      // Invalid: name too short
      const invalidResult = v.safeParse(decomposed, {
        'organization.teams.engineering.members.lead.name': 'Al',
      });
      expect(invalidResult.success).toBe(false);
    });

    it('#06 => should fail validation on deeply nested object with unknown key at final path level', () => {
      const schema = v.object({
        application: v.object({
          services: v.object({
            database: v.object({
              connection: v.object({
                host: v.string(),
                port: v.number(),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Valid nested path
      const validData = {
        'application.services.database.connection.host': 'localhost',
        'application.services.database.connection.port': 5432,
      };
      const validResult = v.safeParse(decomposed, validData);
      expect(validResult.success).toBe(true);

      // Unknown key at the final level of existing path
      const unknownFinalKeyData = {
        'application.services.database.connection.host': 'localhost',
        'application.services.database.connection.unknownField': 'value',
      };
      const unknownResult = v.safeParse(decomposed, unknownFinalKeyData);
      expect(unknownResult.success).toBe(false);

      if (!unknownResult.success) {
        const issues = v.flatten(unknownResult.issues);
        const expected = {
          nested: {
            'application.services.database.connection.unknownField': [
              'Invalid key: Expected never but received "application.services.database.connection.unknownField"',
            ],
          },
        };
        expect(issues).toEqual(expected);
      }
    });

    it('#07 => should fail validation with unknown intermediate path in deeply nested structure', () => {
      const schema = v.object({
        system: v.object({
          monitoring: v.object({
            metrics: v.object({
              cpu: v.object({
                usage: v.number(),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);
      // Valid path
      const validData = {
        'system.monitoring.metrics.cpu.usage': 75.5,
      };
      const validResult = v.safeParse(decomposed, validData);
      expect(validResult.success).toBe(true);

      // Unknown intermediate path
      const unknownIntermediateData = {
        'system.monitoring.metrics.cpu.usage': 75.5,
        'system.monitoring.unknownService.data': 'value',
      };
      const unknownResult = v.safeParse(
        decomposed,
        unknownIntermediateData,
      );
      expect(unknownResult.success).toBe(false);

      if (!unknownResult.success) {
        const issues = v.flatten(unknownResult.issues);
        expect(issues.nested).toHaveProperty(
          'system.monitoring.unknownService.data',
        );
      }
    });

    it('#08 => should fail validation with multiple unknown keys at different nesting levels', async () => {
      const schema = v.object({
        workspace: v.object({
          projects: v.object({
            frontend: v.object({
              config: v.object({
                buildTool: v.string(),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Multiple unknown keys at different levels
      const multipleUnknownData = {
        'workspace.projects.frontend.config.buildTool': 'vite',
        'workspace.projects.unknownProject.setting': 'value2',
        'workspace.unknownProperty': 'value3',
        'workspace.projects.frontend.config.unknownConfig': 'value1',
      };

      const result = v.safeParse(decomposed, multipleUnknownData, {
        abortEarly: false,
        abortPipeEarly: false,
        lang: 'fr',
      });
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.issues.length).toBeGreaterThan(0);
      }
    });

    it('#09 => should handle validation with partial known paths and unknown final keys', () => {
      const schema = v.object({
        api: v.object({
          v2: v.object({
            endpoints: v.object({
              users: v.object({
                create: v.string(),
                read: v.string(),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Mix of valid and invalid final keys
      const mixedData = {
        'api.v2.endpoints.users.create': '/api/v2/users',
        'api.v2.endpoints.users.read': '/api/v2/users/:id',
        'api.v2.endpoints.users.invalidOperation': '/invalid',
      };

      const result = v.safeParse(decomposed, mixedData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const issues = v.flatten(result.issues);
        expect(issues.nested).toHaveProperty(
          'api.v2.endpoints.users.invalidOperation',
        );
        expect(Object.keys(issues.nested || {})).toHaveLength(1);
      }
    });

    it('#10 => should validate deeply nested schema rejecting unknown keys while accepting valid ones', () => {
      const schema = v.object({
        organization: v.object({
          departments: v.object({
            engineering: v.object({
              teams: v.object({
                backend: v.object({
                  lead: v.string(),
                  members: v.number(),
                }),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Test with valid data only
      const validOnlyData = {
        'organization.departments.engineering.teams.backend.lead':
          'John Doe',
        'organization.departments.engineering.teams.backend.members': 5,
      };
      const validResult = v.safeParse(decomposed, validOnlyData);
      expect(validResult.success).toBe(true);

      // Test with unknown key at deepest level
      const withUnknownData = {
        'organization.departments.engineering.teams.backend.lead':
          'John Doe',
        'organization.departments.engineering.teams.backend.members': 5,
        'organization.departments.engineering.teams.backend.budget': 100000,
      };
      const unknownResult = v.safeParse(decomposed, withUnknownData);
      expect(unknownResult.success).toBe(false);

      if (!unknownResult.success) {
        const issues = v.flatten(unknownResult.issues);
        expect(issues.nested).toHaveProperty(
          'organization.departments.engineering.teams.backend.budget',
        );
        expect(Object.keys(issues.nested || {})).toHaveLength(1);
      }
    });

    it('#11 => should fail validation with unknown branch in existing path structure', () => {
      const schema = v.object({
        config: v.object({
          database: v.object({
            primary: v.object({
              host: v.string(),
              port: v.number(),
            }),
            secondary: v.object({
              host: v.string(),
              port: v.number(),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Valid data
      const validData = {
        'config.database.primary.host': 'primary-db.com',
        'config.database.secondary.port': 5433,
      };
      const validResult = v.safeParse(decomposed, validData);
      expect(validResult.success).toBe(true);

      // Unknown branch at intermediate level
      const unknownBranchData = {
        'config.database.primary.host': 'primary-db.com',
        'config.database.tertiary.host': 'tertiary-db.com',
      };
      const unknownResult = v.safeParse(decomposed, unknownBranchData);
      expect(unknownResult.success).toBe(false);

      if (!unknownResult.success) {
        const issues = v.flatten(unknownResult.issues);
        expect(issues.nested).toHaveProperty(
          'config.database.tertiary.host',
        );
      }
    });

    it('#12 => should validate deeply nested non-empty object with multiple valid paths', () => {
      const schema = v.object({
        config: v.object({
          environments: v.object({
            production: v.object({
              database: v.object({
                host: v.string(),
                port: v.number(),
              }),
              cache: v.object({
                ttl: v.number(),
                strategy: v.string(),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // Multiple valid paths filled
      const multiPathData = {
        'config.environments.production.database.host': 'prod-db.com',
        'config.environments.production.database.port': 5432,
        'config.environments.production.cache.ttl': 3600,
        'config.environments.production.cache.strategy': 'lru',
      };

      const result = v.safeParse(decomposed, multiPathData);
      expect(result.success).toBe(true);
      expect(result.output).toEqual(multiPathData);
    });

    it('#13 => should fail validation on deeply nested non-empty object with partial type mismatch', () => {
      const schema = v.object({
        app: v.object({
          modules: v.object({
            auth: v.object({
              oauth: v.object({
                google: v.object({
                  clientId: v.string(),
                  clientSecret: v.string(),
                  redirectUri: v.pipe(v.string(), v.url()),
                }),
              }),
            }),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // One field has invalid URL
      const invalidUrlData = {
        'app.modules.auth.oauth.google.clientId': 'client-123',
        'app.modules.auth.oauth.google.clientSecret': 'secret-456',
        'app.modules.auth.oauth.google.redirectUri': 'not-a-url',
      };

      const result = v.safeParse(decomposed, invalidUrlData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = v.flatten(result.issues);
        const expected = {
          nested: {
            'app.modules.auth.oauth.google.redirectUri': [
              'Invalid URL: Received "not-a-url"',
            ],
          },
        };
        expect(issues).toEqual(expected);
      }
    });

    it('#14 => should validate deeply nested non-empty object with all nullable fields filled', () => {
      const schema = v.object({
        project: v.object({
          metadata: v.object({
            tags: v.nullable(
              v.object({
                category: v.string(),
                priority: v.number(),
              }),
            ),
            description: v.optional(
              v.object({
                short: v.string(),
                long: v.optional(v.string()),
              }),
            ),
          }),
        }),
      });

      const decomposed = decomposeSchema(schema);

      // All optional fields provided
      const fullData = {
        'project.metadata.tags.category': 'feature',
        'project.metadata.tags.priority': 1,
        'project.metadata.description.short': 'A project',
        'project.metadata.description.long':
          'A longer description of the project',
      };

      const result = v.safeParse(decomposed, fullData);
      expect(result.success).toBe(true);
      expect(result.output).toEqual(fullData);
    });
  });
});
