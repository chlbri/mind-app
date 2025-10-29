# Zed Editor Quick Reference

> Quick cheat sheet for daily Zed usage in this project

## 🚀 Getting Started

```bash
# Open project
zed .

# Open specific file
zed path/to/file.ts

# Open with new window
zed -n .
```

## ⌨️ Essential Shortcuts

### Navigation
| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Command Palette | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| Quick Open File | `Cmd+P` | `Ctrl+P` |
| Go to Symbol | `Cmd+Shift+O` | `Ctrl+Shift+O` |
| Go to Line | `Ctrl+G` | `Ctrl+G` |
| Go to Definition | `F12` | `F12` |
| Go Back | `Cmd+Alt+-` | `Ctrl+Alt+-` |
| Go Forward | `Cmd+Shift+-` | `Ctrl+Shift+-` |

### Editing
| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Multi-cursor (next) | `Cmd+D` | `Ctrl+D` |
| Multi-cursor (all) | `Cmd+Shift+L` | `Ctrl+Shift+L` |
| Add cursor above/below | `Alt+Shift+↑/↓` | `Alt+Shift+↑/↓` |
| Comment/Uncomment | `Cmd+/` | `Ctrl+/` |
| Format Document | `Cmd+Shift+I` | `Ctrl+Shift+I` |
| Duplicate Line | `Cmd+Shift+D` | `Ctrl+Shift+D` |

### Panels & Views
| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Toggle Terminal | `Cmd+J` | `Ctrl+J` |
| AI Assistant | `Cmd+?` | `Ctrl+?` |
| Project Panel | `Cmd+K Cmd+E` | `Ctrl+K Ctrl+E` |
| Find in Files | `Cmd+Shift+F` | `Ctrl+Shift+F` |
| Git Panel | `Cmd+Shift+G` | `Ctrl+Shift+G` |

### Panes
| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Split Right | `Cmd+K →` | `Ctrl+K →` |
| Split Down | `Cmd+K ↓` | `Ctrl+K ↓` |
| Close Pane | `Cmd+W` | `Ctrl+W` |
| Switch Pane | `Cmd+K Cmd+Arrow` | `Ctrl+K Ctrl+Arrow` |

## 🤖 AI Features

### Agent Panel
```
Cmd+? / Ctrl+?    Open Agent Panel
/command          Use slash command
```

### Custom Project Commands
```
/codegen-assets   Regenerate asset types (runs: pnpm run codegen:assets)
/ui               Create SolidJS component following project conventions
```

### AI Tips
- Select code before asking questions for context
- Use `/` to see available slash commands
- AI has access to project files automatically

## 📁 Project Structure

```
src/
├── features/              # 👉 START HERE for new work
│   └── [feature]/
│       └── front/
│           ├── components/   # Feature components
│           ├── signals/      # Feature state
│           └── utils/        # Feature utilities
│
└── globals/ui/           # Shared (after 2+ uses)
    ├── cn/               # ⚠️ DON'T MODIFY (CLI managed)
    │   └── components/ui/
    ├── molecules/        # Shared components
    ├── organisms/        # Complex components
    └── signals/          # Global state
```

## 🎯 Common Tasks

### Add UI Primitive Component
```bash
# List available components
npx shadcn-solid@latest

# Add component
npx shadcn-solid@latest add button
npx shadcn-solid@latest add card
npx shadcn-solid@latest add dialog
```

### Run Project Commands
```bash
pnpm run dev              # Start dev server
pnpm run lint             # Run linter
pnpm run codegen:assets   # Generate asset types
pnpm test                 # Run tests
pnpm run build            # Build project
```

### Using Tasks (Cmd+Shift+P → "task: spawn")
```json
// .zed/tasks.json
[
  {
    "label": "Dev Server",
    "command": "pnpm run dev"
  },
  {
    "label": "Lint",
    "command": "pnpm run lint"
  }
]
```

## 🔧 Configuration Locations

```
Project:
  .zed/settings.json       # Project settings
  .zed/tasks.json          # Project tasks

Global:
  ~/.config/zed/settings.json   # User settings
  ~/.config/zed/keymap.json     # Key bindings
  ~/.config/zed/tasks.json      # Global tasks

Custom:
  .github/prompts/              # AI slash commands
  .github/copilot-instructions.md  # Commit guidelines
```

## 💡 Quick Settings

### Open Settings
```
Cmd+,  or  Ctrl+,
```

### Essential Settings
```json
{
  "base_keymap": "VSCode",
  "format_on_save": "on",
  "autosave": "on_focus_change",
  "tab_size": 2,
  "vim_mode": false,
  "git": {
    "inline_blame": {
      "enabled": true
    }
  }
}
```

## 🔍 Search & Replace

### Project Search
```
Cmd+Shift+F / Ctrl+Shift+F
```

### Regex Syntax (Zed vs Vim)
```
Capture Groups:  ()    not  \(\)
References:      $1    not  \1
Case Insensitive: (?i) at start or Alt+Cmd+C
```

## 🌳 Git Integration

### Git Gutter
- Green: Added lines
- Yellow: Modified lines
- Red: Deleted lines

### Git Actions
```
Click gutter         Stage/unstage hunk
Cmd+Shift+G          Open git panel
Status bar           Switch branches
```

### Inline Blame
```json
{
  "git": {
    "inline_blame": {
      "enabled": true,
      "delay_ms": 500,
      "show_commit_summary": true
    }
  }
}
```

## 🎨 Component Development Checklist

When creating components with `/ui`:

- [ ] Start in `src/features/[feature-name]/front/components/`
- [ ] Use TypeScript strict types
- [ ] Handle `class` prop with `cn()`
- [ ] Add ARIA attributes
- [ ] Support keyboard navigation
- [ ] Support dark mode
- [ ] Use `splitProps` for native props
- [ ] Test accessibility
- [ ] Migrate to `globals/` only if reused 2+ times
- [ ] **Never** edit `cn/components/ui/` manually

## 📝 Commit Guidelines

Use these commit types (from `.github/copilot-instructions.md`):

```
feat:      New feature (minor version)
fix:       Bug fix (patch version)
hot-fix:   Critical bug fix (patch version)
docs:      Documentation only (patch version)
style:     Code style changes (no version)
test:      Tests added/removed (patch version)
build:     Build file changes (no version)
revert:    Revert previous commit (patch version)

Format:
<type>(<scope>): <title in English>

<body in French, max 200 words>

[BREAKING CHANGE] if applicable
chlbri: bri_lvi@icloud.com
```

## 🐛 Troubleshooting

### Language Server Issues
```
Cmd+Shift+P → "editor: restart language server"
```

### Performance Issues
```json
{
  "file_scan_exclusions": [
    "**/node_modules",
    "**/.git",
    "**/dist",
    "**/.next"
  ]
}
```

### View Logs
```
Cmd+Shift+P → "zed: open log"
```

## 📚 Resources

- **Full Guide**: `.github/docs/ZED_EDITOR_GUIDE.md`
- **Official Docs**: https://zed.dev/docs
- **Extensions**: https://github.com/zed-industries/extensions
- **Community**: https://discord.gg/zed
- **Custom Prompts**: `.github/prompts/`

## 🎯 Daily Workflow

1. **Open project**: `zed .`
2. **Quick open**: `Cmd+P` for files
3. **Run task**: `Cmd+Shift+P` → "task: spawn"
4. **AI help**: `Cmd+?` → use `/ui` or `/codegen-assets`
5. **Git**: Stage hunks in gutter, commit from git panel
6. **Format**: Auto on save (or `Cmd+Shift+I`)
7. **Search**: `Cmd+Shift+F` project-wide

---

**Pro Tip**: Keep this file open in a split pane for quick reference! (`Cmd+K →`)