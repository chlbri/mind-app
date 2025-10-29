# Custom Slash Commands in Zed Editor

> Complete guide to creating and using custom AI prompts (slash commands) in Zed Editor for this project.

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Available Commands](#available-commands)
- [Creating Your Own Commands](#creating-your-own-commands)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

Zed Editor allows you to create custom AI prompts that can be invoked using slash commands in the Agent Panel. These are markdown files stored in `.github/prompts/` that provide context and instructions to the AI assistant.

### Why Use Custom Commands?

- **Consistency**: Ensure AI generates code following project conventions
- **Efficiency**: Reduce repetitive instructions
- **Onboarding**: Help new team members understand project patterns
- **Documentation**: Living documentation that the AI can use
- **Automation**: Trigger common tasks with simple commands

## How It Works

1. **Create** a `.prompt.md` file in `.github/prompts/`
2. **Name** it with the command you want (e.g., `test.prompt.md` → `/test`)
3. **Write** instructions in markdown format
4. **Use** it in Zed's Agent Panel with `/[command-name]`

### File Naming Convention

```
.github/prompts/[command-name].prompt.md
                └─────┬─────┘
                      │
                This becomes your /command-name
```

### Project Structure

```
ivoire-cours-web1/
└── .github/
    └── prompts/
        ├── codegen-assets.prompt.md  → /codegen-assets
        ├── ui.prompt.md              → /ui
        ├── test.prompt.md            → /test
        ├── commit.prompt.md          → /commit
        └── [your-command].prompt.md  → /your-command
```

## Available Commands

### 1. `/codegen-assets` - Asset Type Generation

**Purpose**: Regenerate TypeScript types from `public/` folder structure.

**When to use**:
- After adding new images, icons, or files to `public/`
- After renaming or moving assets
- When asset types are out of sync with files

**What it does**:
```bash
pnpm run codegen:assets
```

**Output**:
```typescript
export const ASSETS = {
  images: {
    logoTexte: '/images/logo-texte.png',
    logoTexteNoBackground: '/images/logo-texte.no-background.png'
  },
  icons: {
    home: '/icons/home.svg'
  }
} as const;
```

---

### 2. `/ui` - UI Component Builder

**Purpose**: Generate SolidJS components following project architecture.

**Tech Stack Context**:
- SolidJS v1.9.9
- TanStack Start v1.132.56
- Tailwind CSS v4.1.14
- Kobalte UI
- Valibot v1.1.0

**Architecture Rules**:
- Start in `features/[feature-name]/front/`
- Migrate to `globals/` only when reused 2+ times
- Never modify `globals/ui/cn/components/ui/` manually
- Use shadcn-solid CLI for primitives

**Example Usage**:
```
You: /ui I need a user profile card with avatar, name, email, and edit button

AI: [Generates component following project conventions]
```

---

### 3. `/test` - Test Generator

**Purpose**: Generate unit and integration tests following project patterns.

**Testing Stack**:
- Vitest
- @solidjs/testing-library
- Testing conventions for SolidJS components

**What it generates**:
- Component tests with accessibility checks
- Utility function tests
- Signal/state management tests
- Mock configurations

**Example Usage**:
```
You: /test Generate tests for UserCard component

AI: [Creates UserCard.test.tsx with comprehensive test coverage]
```

---

### 4. `/commit` - Commit Message Generator

**Purpose**: Generate conventional commit messages following project standards.

**Commit Types**:
- `feat`: New feature (minor version)
- `fix`: Bug fix (patch version)
- `hot-fix`: Critical bug fix (patch version)
- `docs`: Documentation (patch version)
- `build`: Build files (no version)
- `style`: Code style (no version)
- `test`: Tests (patch version)
- `revert`: Revert commit (patch version)

**Format**:
```
type(scope): Title in English

Body in French (max 200 words, explains WHY).

[BREAKING CHANGE] (if applicable)
chlbri: bri_lvi@icloud.com
```

**Example Usage**:
```
You: /commit I added email verification to the auth system

AI:
feat(auth): Add email verification flow

Ajout d'un système de vérification par email pour les nouveaux 
utilisateurs avec envoi de lien de confirmation.

chlbri: bri_lvi@icloud.com
```

## Creating Your Own Commands

### Step 1: Create the File

Create a new file in `.github/prompts/`:

```bash
touch .github/prompts/your-command.prompt.md
```

### Step 2: Write the Prompt

Use this template:

```markdown
# [Command Name]

Brief description of what this command does (1-2 sentences).

## Context

Provide project-specific context:
- Tech stack information
- File structure
- Conventions to follow
- Related dependencies
- Important constraints

## Task

Clear instructions on what the AI should do:
1. Analyze [what]
2. Generate [what]
3. Follow [which conventions]
4. Output [what format]

## Examples

### Example 1: [Description]

[Input/scenario]

[Expected output with code blocks]

### Example 2: [Description]

[Input/scenario]

[Expected output with code blocks]

## Rules

List specific rules:
- ✅ DO: Use named exports
- ❌ DON'T: Use default exports
- ✅ DO: Include TypeScript types
- ❌ DON'T: Use `any` type

## Output Format

Specify exactly what the AI should output:
- No extra commentary
- Just the code/result
- Specific format indicators
```

### Step 3: Test Your Command

1. Open Zed: `zed .`
2. Open Agent Panel: `Cmd+?` (Mac) / `Ctrl+?` (Linux/Windows)
3. Type `/your-command`
4. Test with various inputs
5. Refine the prompt based on results

## Best Practices

### 1. Be Specific

❌ **Bad**: "Generate a component"
✅ **Good**: "Generate a SolidJS component using Kobalte UI primitives, Tailwind CSS for styling, with TypeScript strict types and accessibility attributes"

### 2. Include Context

Always provide:
- Tech stack versions
- File structure
- Naming conventions
- Code style preferences
- Related files or dependencies

### 3. Use Examples

Show the AI exactly what you want:
```markdown
## Examples

### Good Component Structure
[Show actual code from your project]

### Bad Component Structure
[Show what to avoid]
```

### 4. Define Output Format

Tell the AI exactly what to output:
```markdown
## Output Format

Return only:
1. File path
2. Number of items generated
3. Brief summary (1 line)

Format:
✅ Created: src/features/auth/components/LoginForm.tsx
📊 3 components generated
🎯 Coverage: form, validation, accessibility
```

### 5. Keep It Focused

Each command should do ONE thing well:
- ✅ `/test` generates tests
- ✅ `/commit` generates commit messages
- ❌ `/test-and-commit` does too much

### 6. Reference Project Standards

Link to project documentation:
```markdown
## Context

Follow conventions defined in:
- `.github/copilot-instructions.md` for commits
- `src/features/README.md` for architecture
- `.github/docs/ZED_EDITOR_GUIDE.md` for workflow
```

## Examples

### Example 1: API Client Generator

```markdown
# API Client Generator

Generates type-safe API client functions using TanStack Query.

## Context

- Uses `@tanstack/solid-query` v5.x
- API base URL: defined in `src/globals/config/api.ts`
- Authentication: JWT token in headers
- Error handling: custom `ApiError` class

## Task

1. Analyze the API endpoint specification
2. Generate TypeScript types for request/response
3. Create query/mutation hooks
4. Include error handling
5. Add JSDoc comments

## Examples

### Input
"GET /api/users/:id - Returns user profile"

### Output
[Generated code with types, hooks, error handling]

## Rules

- ✅ Use `createQuery` for GET requests
- ✅ Use `createMutation` for POST/PUT/DELETE
- ✅ Include TypeScript strict types
- ✅ Handle loading and error states
- ❌ Don't use `any` type
- ❌ Don't hardcode API URLs
```

### Example 2: Migration Generator

```markdown
# Database Migration Generator

Creates database migration files following project conventions.

## Context

- Database: PostgreSQL 15
- ORM: Drizzle ORM
- Migration location: `drizzle/migrations/`
- Naming: `YYYY-MM-DD-HH-MM-SS_description.sql`

## Task

1. Generate migration file with timestamp
2. Include both UP and DOWN migrations
3. Add transaction wrapper
4. Include comments

## Examples

### Input
"Add email_verified column to users table"

### Output
```sql
-- Migration: Add email verification
-- Created: 2024-01-15 10:30:00

BEGIN;

-- UP
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE NOT NULL;

CREATE INDEX idx_users_email_verified 
ON users(email_verified);

COMMIT;

-- DOWN (Rollback)
-- BEGIN;
-- DROP INDEX idx_users_email_verified;
-- ALTER TABLE users DROP COLUMN email_verified;
-- COMMIT;
```

## Rules

- ✅ Always include rollback (DOWN) migration
- ✅ Use transactions
- ✅ Add indexes for foreign keys
- ✅ Include timestamps
- ❌ Never drop data without backup
```

### Example 3: Refactor Helper

```markdown
# Refactor Helper

Helps refactor code following modern best practices.

## Context

- SolidJS v1.9.9
- TypeScript strict mode
- Prefer composition over inheritance
- Use signals for state
- Avoid unnecessary reactivity

## Task

1. Analyze the provided code
2. Identify potential improvements
3. Suggest refactoring
4. Explain the benefits
5. Show before/after

## Examples

### Before
```typescript
function UserCard(props: any) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(setData);
  }, []);
  
  return <div>{data?.name}</div>;
}
```

### After
```typescript
interface UserCardProps {
  userId: string;
  class?: string;
}

const UserCard: Component<UserCardProps> = props => {
  const user = createQuery(() => ({
    queryKey: ['user', props.userId],
    queryFn: () => fetchUser(props.userId),
  }));
  
  return (
    <div class={cn('user-card', props.class)}>
      <Show when={user.data} fallback={<Skeleton />}>
        {user => <h3>{user().name}</h3>}
      </Show>
    </div>
  );
};
```

### Benefits
- Type safety with TypeScript
- Better loading states with `<Show>`
- Query caching with TanStack Query
- Proper props interface
- Class name customization

## Rules

- ✅ Add TypeScript types
- ✅ Use SolidJS patterns (Show, For, etc.)
- ✅ Handle loading/error states
- ✅ Make components reusable
- ❌ Don't break existing functionality
- ❌ Don't add unnecessary complexity
```

## Troubleshooting

### Command Not Showing Up

**Problem**: Typed `/my-command` but it's not in the autocomplete.

**Solutions**:
1. Check file location: Must be in `.github/prompts/`
2. Check file name: Must end with `.prompt.md`
3. Restart Zed: `Cmd+Q` then reopen
4. Check syntax: Ensure valid markdown

### AI Not Following Instructions

**Problem**: AI ignores parts of your prompt.

**Solutions**:
1. Use bold/emphasis for important rules: **ALWAYS** or **NEVER**
2. Add examples showing exact format
3. Be more explicit: "Output ONLY the code, NO explanations"
4. Use checklists: `- [ ] Include tests`

### Command Too Slow

**Problem**: AI takes too long to respond.

**Solutions**:
1. Reduce context: Remove unnecessary examples
2. Be more specific: Don't make AI guess
3. Split commands: One command = one purpose
4. Use shorter prompts: Keep under 500 lines

### Inconsistent Results

**Problem**: Same command gives different results.

**Solutions**:
1. Add more examples showing edge cases
2. Define output format explicitly
3. Include "what NOT to do" examples
4. Use templates in the prompt

## Advanced Tips

### 1. Composable Prompts

Reference other prompts:
```markdown
## Context

Follow UI component conventions from `/ui` prompt.
Use commit format from `/commit` prompt.
```

### 2. Dynamic Context

Use placeholders:
```markdown
## Task

Generate a [COMPONENT_TYPE] with:
- [PROPS_DESCRIPTION]
- [FEATURES_DESCRIPTION]
```

### 3. Conditional Instructions

```markdown
## Rules

If generating a form:
- ✅ Use Valibot for validation
- ✅ Include error messages

If generating a list:
- ✅ Use `<For>` component
- ✅ Include empty state
```

### 4. Multi-step Workflows

```markdown
## Task

Step 1: Analyze requirements
Step 2: Generate types
Step 3: Generate component
Step 4: Generate tests
Step 5: Update documentation
```

## Related Resources

- [Zed Editor Guide](./ZED_EDITOR_GUIDE.md) - Complete Zed setup
- [Quick Reference](./ZED_QUICK_REFERENCE.md) - Daily commands
- [Commit Guidelines](../copilot-instructions.md) - Project conventions
- [Zed Prompts Documentation](https://zed.dev/docs/assistant/prompts) - Official docs

## Contributing

When adding new commands:

1. Test thoroughly with various inputs
2. Document in this guide
3. Add usage examples
4. Update README.md if needed
5. Share with team

---

**Last Updated**: January 2024  
**Maintainer**: chlbri (bri_lvi@icloud.com)