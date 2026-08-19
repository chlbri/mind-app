# Documentation Directory

This directory contains comprehensive documentation for the
`ivoire-cours-web1` project, including editor setup, workflows, and best
practices.

## 📚 Available Documentation

### [Zed Editor Guide](./ZED_EDITOR_GUIDE.md)

**Comprehensive guide for using Zed Editor**

A complete resource covering:

- Installation and setup
- Key features and capabilities
- Configuration best practices
- Custom prompts usage (`/codegen-assets`, `/ui`)
- Transitioning from VSCode
- Advanced workflows
- Troubleshooting

**Target audience**: Anyone wanting to use Zed Editor for this project,
especially those coming from VSCode.

---

### [Zed Custom Commands](./ZED_CUSTOM_COMMANDS.md)

**Complete guide to creating custom slash commands**

Learn how to create and use custom AI prompts:

- Understanding slash commands
- Available commands (`/codegen-assets`, `/ui`, `/test`, `/commit`)
- Step-by-step guide to creating your own
- Best practices and examples
- Troubleshooting

**Target audience**: Developers who want to create custom AI assistants for
repetitive tasks.

---

### [Zed Quick Reference](./ZED_QUICK_REFERENCE.md)

**Quick cheat sheet for daily use**

Fast reference for:

- Essential keyboard shortcuts
- Common tasks and commands
- Project structure overview
- Git integration tips
- Component development checklist
- Commit guidelines

**Target audience**: Developers who need a quick lookup while working.

---

## 🎯 Getting Started

1. **New to Zed?** → Start with the
   [Zed Editor Guide](./ZED_EDITOR_GUIDE.md)
2. **Daily work?** → Keep [Quick Reference](./ZED_QUICK_REFERENCE.md) handy
3. **Custom prompts?** → Read
   [Custom Commands Guide](./ZED_CUSTOM_COMMANDS.md)
4. **Need examples?** → Check `.github/prompts/` directory

## 🔧 Project-Specific Information

### Custom AI Prompts

Located in `.github/prompts/`:

- **`codegen-assets.prompt.md`** - Regenerates asset types from `public/`
  folder
  - Usage: `/codegen-assets` in Zed AI panel
  - Runs: `pnpm run codegen:assets`

- **`ui.prompt.md`** - Guides UI component creation
  - Usage: `/ui` in Zed AI panel
  - Follows SolidJS + Kobalte + Tailwind conventions

- **`test.prompt.md`** - Generates unit and integration tests
  - Usage: `/test` in Zed AI panel
  - Creates tests following Vitest conventions

- **`commit.prompt.md`** - Generates conventional commit messages
  - Usage: `/commit` in Zed AI panel
  - Follows project commit guidelines

**See full guide**:
[Custom Commands Documentation](./ZED_CUSTOM_COMMANDS.md)

### Configuration Files

```
.zed/
├── settings.json    # Project-specific settings
└── tasks.json       # Project tasks (if created)

.github/
├── prompts/         # Custom AI slash commands
├── docs/            # This directory
└── copilot-instructions.md  # Commit guidelines
```

## 📖 Quick Links

### Essential Commands

```bash
# Development
pnpm run dev              # Start dev server
pnpm run lint             # Lint codebase
pnpm run codegen:assets   # Generate asset types
pnpm test                 # Run tests
pnpm run build            # Build for production

# Zed Editor
zed .                     # Open project
zed README.md             # Open file
```

### Key Shortcuts (with VSCode keymap)

| Action          | Shortcut           |
| --------------- | ------------------ |
| Command Palette | `Cmd/Ctrl+Shift+P` |
| Quick Open      | `Cmd/Ctrl+P`       |
| AI Assistant    | `Cmd/Ctrl+?`       |
| Terminal        | `Cmd/Ctrl+J`       |
| Git Panel       | `Cmd/Ctrl+Shift+G` |

## 🏗️ Project Architecture

### Component Organization

```
src/
├── features/              # ⭐ Start here for new components
│   └── [feature]/
│       └── front/
│           ├── components/   # Feature-specific components
│           ├── signals/      # Feature-specific state
│           └── utils/        # Feature-specific utilities
│
└── globals/ui/           # Shared components (migrate here after reuse)
    ├── cn/               # ⚠️ CLI-managed (don't edit manually)
    │   └── components/ui/   # shadcn-solid primitives
    ├── molecules/        # Shared molecular components
    ├── organisms/        # Shared complex components
    └── signals/          # Global state
```

### Key Principles

1. **Start in `features/`** - All new work begins in a feature directory
2. **Migrate to `globals/`** - Only after component is reused in 2+ places
3. **Never edit `cn/components/ui/`** - Use CLI:
   `npx shadcn-solid@latest add [component]`
4. **Follow conventions** - Use `/ui` prompt for guidance

## 🤝 Contributing

### Commit Message Format

Follow guidelines in `.github/copilot-instructions.md`:

```
<type>(<scope>): <title in English>

<body in French, max 200 words>

[BREAKING CHANGE] if applicable
chlbri: bri_lvi@icloud.com
```

**Types**: `feat`, `fix`, `hot-fix`, `docs`, `style`, `test`, `build`,
`revert`

### Development Workflow

1. Create feature branch
2. Work in `src/features/[feature-name]/front/`
3. Use `/ui` prompt for component guidance
4. Run `pnpm run lint` before commit
5. Follow commit message format
6. Create PR for review

## 🆘 Support

### Documentation Issues

If you find issues with this documentation:

1. Check the [Zed Editor Guide](./ZED_EDITOR_GUIDE.md) troubleshooting
   section
2. Consult [official Zed docs](https://zed.dev/docs)
3. Ask in team chat or create an issue

### Editor Issues

1. Restart language server: `Cmd+Shift+P` → "editor: restart language
   server"
2. Check logs: `Cmd+Shift+P` → "zed: open log"
3. Review [troubleshooting section](./ZED_EDITOR_GUIDE.md#troubleshooting)

## 📝 Maintenance

This documentation should be updated when:

- New custom prompts are added
- Project structure changes significantly
- New development patterns are established
- Zed Editor introduces breaking changes

---

## 📚 External Resources

- **Zed Official Docs**: https://zed.dev/docs
- **Zed Extensions**: https://github.com/zed-industries/extensions
- **Zed Community**: https://discord.gg/zed
- **SolidJS Docs**: https://docs.solidjs.com
- **Kobalte UI**: https://kobalte.dev
- **Tailwind CSS**: https://tailwindcss.com

---

**Last Updated**: 2025-01-XX **Maintainer**: Project Team
