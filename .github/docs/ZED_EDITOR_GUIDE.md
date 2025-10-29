# Zed Editor Comprehensive Guide

> A complete guide to using Zed Editor effectively, including setup, key features, workflow tips, and custom prompts for this project.

## Table of Contents

- [Introduction](#introduction)
- [Why Zed?](#why-zed)
- [Installation](#installation)
- [Initial Setup](#initial-setup)
- [Key Features](#key-features)
- [Configuration](#configuration)
- [Custom Prompts in This Project](#custom-prompts-in-this-project)
- [Transitioning from VSCode](#transitioning-from-vscode)
- [Workflow Tips](#workflow-tips)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

---

## Introduction

Zed is a high-performance, multiplayer code editor built by the creators of Atom and Tree-sitter. It's designed to be fast, efficient, and collaborative, with native AI integration.

### Key Philosophy

- **Performance First**: Written in Rust, Zed is incredibly fast
- **AI-Native**: Built-in AI assistant and features
- **Collaborative**: Real-time collaboration without extensions
- **Modern**: Tree-sitter for syntax awareness, LSP support

---

## Why Zed?

### Advantages over VSCode

1. **Speed**: 10-100x faster startup and operations
2. **Native Performance**: Rust-based, not Electron
3. **Built-in AI**: No extensions needed for AI features
4. **Multiplayer**: Native real-time collaboration
5. **Lower Resource Usage**: Less RAM and CPU consumption
6. **Modern Architecture**: Tree-sitter integration from the start

### What You Might Miss from VSCode

- Extensive extension ecosystem (though Zed is growing)
- Some language-specific tooling
- Certain debugger integrations
- Marketplace for themes and plugins

---

## Installation

### macOS

```bash
# Via Homebrew (recommended)
brew install --cask zed

# Or download from website
# https://zed.dev
```

### Windows

Download from [https://zed.dev](https://zed.dev) or use the installer.

### Linux

```bash
# Installation script
curl -f https://zed.dev/install.sh | sh

# Preview build
curl -f https://zed.dev/install.sh | ZED_CHANNEL=preview sh
```

### CLI Installation

After installing Zed, enable the CLI:

1. Open Zed
2. Open Command Palette: `Cmd+Shift+P` (macOS) / `Ctrl+Shift+P` (Windows/Linux)
3. Type: `cli: install`
4. This creates a `zed` command in `/usr/local/bin/`

**Usage:**

```bash
# Open current directory
zed .

# Open specific file
zed README.md

# Open with new window
zed -n .

# Read from stdin
ps aux | zed -
```

---

## Initial Setup

### First Launch Checklist

1. **Enable Vim Mode** (optional): If you're a Vim user
2. **Configure Theme**: Choose light/dark theme
3. **Set Up AI**: Configure your AI provider (Anthropic, OpenAI, etc.)
4. **Install Extensions**: Basic language support
5. **Configure Settings**: Open settings with `Cmd+,` / `Ctrl+,`

### Recommended Initial Settings

```json
{
  "theme": {
    "mode": "system",
    "dark": "One Dark",
    "light": "One Light"
  },
  "buffer_font_family": "JetBrains Mono",
  "buffer_font_size": 14,
  "ui_font_size": 16,
  "tab_size": 2,
  "format_on_save": "on",
  "autosave": "on_focus_change",
  "vim_mode": false,
  "base_keymap": "VSCode",
  "telemetry": {
    "diagnostics": true,
    "metrics": true
  },
  "languages": {
    "TypeScript": {
      "tab_size": 2,
      "format_on_save": "on"
    },
    "JavaScript": {
      "tab_size": 2,
      "format_on_save": "on"
    }
  }
}
```

---

## Key Features

### 1. Command Palette

**Shortcut**: `Cmd+Shift+P` / `Ctrl+Shift+P`

The Command Palette is your gateway to all Zed functionality. Type to search for any command, setting, or action.

**Pro Tip**: You can use fuzzy search - type partial words to find commands quickly.

### 2. File Finder

**Shortcut**: `Cmd+P` / `Ctrl+P`

Quick file navigation with fuzzy search. Type parts of the filename to find it instantly.

**Advanced**:
- `@` - Go to symbol in current file
- `#` - Go to symbol in project
- `:` - Go to line number

### 3. AI Assistant

Zed has native AI integration supporting multiple providers:

- **Anthropic Claude**: Best for coding tasks
- **OpenAI**: GPT-4, GPT-3.5
- **Ollama**: Local models
- **Google AI**: Gemini models

**Activate**: `Cmd+?` / `Ctrl+?` (opens Agent Panel)

**Features**:
- Inline code generation
- Chat-based assistance
- Code transformations
- Context-aware suggestions

### 4. Agent Panel

The Agent Panel is Zed's interface for interacting with AI. It supports:

- **Slash Commands**: Custom prompts (see next section)
- **File Context**: Automatically includes relevant files
- **Multi-turn Conversations**: Maintain context
- **Code Actions**: Apply changes directly

### 5. Multi-cursor Support

Zed has powerful multi-cursor editing:

- `Cmd+D` / `Ctrl+D` - Add next occurrence
- `Cmd+Shift+L` / `Ctrl+Shift+L` - Add all occurrences
- `Alt+Click` - Add cursor at position
- `Alt+Shift+Down/Up` - Add cursor below/above

### 6. Tree-sitter Integration

Zed uses Tree-sitter for semantic code understanding:

- **Smart Syntax**: Context-aware highlighting
- **Code Navigation**: Jump to definitions, symbols
- **Refactoring**: Rename, extract, move
- **Fold Regions**: Collapse functions, classes

### 7. Collaboration

Real-time collaboration without plugins:

1. Click "Share" in the title bar
2. Share the link with collaborators
3. They can join and edit in real-time
4. See cursors and selections live

---

## Configuration

### Settings Files

Zed uses JSON for configuration:

- **Global Settings**: `~/.config/zed/settings.json`
- **Project Settings**: `.zed/settings.json` (in project root)
- **Keymap**: `~/.config/zed/keymap.json`
- **Tasks**: `~/.config/zed/tasks.json`

### Quick Access

- **Open Settings**: `Cmd+,` / `Ctrl+,`
- **Open Keymap**: `Cmd+K Cmd+S` / `Ctrl+K Ctrl+S`
- **Open Default Settings**: Command Palette → "zed: open default settings"

### Project-Specific Configuration

Create `.zed/settings.json` in your project root:

```json
{
  "languages": {
    "TypeScript": {
      "tab_size": 2,
      "format_on_save": "on",
      "formatter": "language_server"
    }
  },
  "lsp": {
    "typescript-language-server": {
      "settings": {
        "typescript": {
          "preferences": {
            "importModuleSpecifier": "non-relative"
          }
        }
      }
    }
  }
}
```

### Essential Settings

```json
{
  // Editor behavior
  "autosave": "on_focus_change",
  "format_on_save": "on",
  "ensure_final_newline_on_save": true,
  "remove_trailing_whitespace_on_save": true,
  
  // UI preferences
  "current_line_highlight": "all",
  "cursor_blink": true,
  "show_whitespaces": "selection",
  
  // Git integration
  "git": {
    "git_gutter": "tracked_files",
    "inline_blame": {
      "enabled": true,
      "delay_ms": 500
    }
  },
  
  // Performance
  "file_scan_exclusions": [
    "**/.git",
    "**/node_modules",
    "**/target",
    "**/.next"
  ]
}
```

---

## Custom Prompts in This Project

This project includes custom AI prompts in `.github/prompts/`. These are slash commands you can use in Zed's Agent Panel.

### Available Prompts

#### 1. `/codegen-assets` - Asset Generation

**Location**: `.github/prompts/codegen-assets.prompt.md`

**Purpose**: Regenerate the assets type file from the public folder structure.

**Usage**:
1. Open Agent Panel (`Cmd+?` / `Ctrl+?`)
2. Type `/codegen-assets`
3. The AI will run: `pnpm run codegen:assets`

**What it does**:
- Scans `public/` folder recursively
- Generates `src/globals/types/assets.ts`
- Converts filenames to camelCase
- Handles duplicate filenames
- Outputs: `📊 Found X assets`

**When to use**:
- After adding new files to `public/`
- After renaming/moving assets
- When asset types are out of sync

**Example Output**:
```typescript
// src/globals/types/assets.ts
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

#### 2. `/ui` - UI Component Builder

**Location**: `.github/prompts/ui.prompt.md`

**Purpose**: Build SolidJS UI components following project conventions.

**Stack Information**:
- **Framework**: SolidJS v1.9.9
- **Meta-framework**: TanStack Start v1.132.56
- **Styling**: Tailwind CSS v4.1.14
- **UI Library**: Kobalte UI (accessible components)
- **Validation**: Valibot v1.1.0
- **TypeScript**: v5.9.3 (strict mode)

**Architecture Guidelines**:

```
src/
├── features/               # Start here for new components
│   └── [feature-name]/
│       └── front/
│           ├── components/ # Feature-specific components
│           ├── signals/    # Feature-specific state
│           └── utils/      # Feature-specific utilities
│
└── globals/ui/            # Shared components (after reuse)
    ├── cn/                # ⚠️ DON'T MODIFY - CLI managed
    │   └── components/ui/ # shadcn-solid generated
    ├── molecules/         # Shared molecular components
    ├── organisms/         # Shared complex components
    └── signals/           # Global state
```

**Key Rules**:
1. **Always start in** `features/[feature-name]/front/`
2. **Migrate to** `globals/` only if used in 2+ features
3. **Never modify** `globals/ui/cn/components/ui/` manually
4. **Use CLI** for primitives: `npx shadcn-solid@latest add [component]`

**Usage Examples**:

```typescript
// Create a feature component
interface UserCardProps {
  user: User;
  onEdit?: () => void;
  class?: string;
}

const UserCard: Component<UserCardProps> = props => {
  return (
    <div class={cn('rounded-lg border p-4', props.class)}>
      <h3>{props.user.name}</h3>
      <p>{props.user.email}</p>
      {props.onEdit && (
        <Button onClick={props.onEdit}>Edit</Button>
      )}
    </div>
  );
};
```

**Component Checklist**:
- [ ] TypeScript strict types
- [ ] Handle `class` prop for customization
- [ ] Use `cn()` for class merging
- [ ] ARIA attributes for accessibility
- [ ] Keyboard navigation support
- [ ] Dark mode support
- [ ] Use `splitProps` for props separation
- [ ] Start in `features/` directory

**Adding Primitives**:

```bash
# List available components
npx shadcn-solid@latest

# Add a component
npx shadcn-solid@latest add card
npx shadcn-solid@latest add button
npx shadcn-solid@latest add dialog
```

### Creating Your Own Prompts

Create custom prompts in `.github/prompts/`:

```markdown
# My Custom Prompt

This is what the AI should know when I use this command.

## Context

Project-specific information here.

## Task

What the AI should do.

## Examples

Code examples if needed.
```

Then use in Zed: `/my-custom-prompt`

---

## Transitioning from VSCode

### Keymap

Zed supports VSCode keybindings out of the box:

```json
{
  "base_keymap": "VSCode"
}
```

Other options: `"Atom"`, `"JetBrains"`, `"SublimeText"`, `"TextMate"`, `"None"`

### Common VSCode Features in Zed

| VSCode | Zed | Notes |
|--------|-----|-------|
| Command Palette | Command Palette | Same shortcuts |
| Quick Open | File Finder | `Cmd+P` / `Ctrl+P` |
| Settings UI | Settings JSON | More direct control |
| Extensions Marketplace | Extensions | Growing ecosystem |
| Integrated Terminal | Terminal Panel | Built-in, fast |
| Git Integration | Git Panel | Native support |
| Copilot | AI Assistant | Multiple providers |
| Live Share | Collaboration | Native, no extension |

### Missing Features (and Alternatives)

1. **Extension Marketplace**
   - Zed has extensions but fewer options
   - Most common languages supported
   - Check: [https://github.com/zed-industries/extensions](https://github.com/zed-industries/extensions)

2. **Debugger UI**
   - Basic debugging support
   - Use terminal for advanced debugging
   - Growing support for language-specific debuggers

3. **Settings UI**
   - No GUI for settings
   - Edit JSON directly (more powerful)
   - Use Command Palette for quick settings

4. **Jupyter Notebooks**
   - Not yet supported
   - Use VSCode for notebooks

### Recommended Migration Strategy

**Week 1**: Run both editors
- Use Zed for editing
- Keep VSCode for debugging/notebooks

**Week 2**: Primary Zed
- Move most work to Zed
- Note what you miss

**Week 3**: Full Zed
- Find workarounds or extensions
- Adjust workflow

---

## Workflow Tips

### 1. Project Setup

When opening a project:

```bash
# Navigate to project
cd ~/projects/my-project

# Open in Zed
zed .

# Or from Zed: Cmd+O / Ctrl+O → Select folder
```

**Configure project**:
1. Create `.zed/settings.json`
2. Add language-specific settings
3. Configure tasks (see Tasks section)

### 2. Efficient Navigation

**Multi-file editing**:
1. `Cmd+P` - Quick open
2. Split panes: `Cmd+K` then arrow keys
3. Switch between panes: `Cmd+K Cmd+Arrow`

**Code navigation**:
- `Cmd+Click` - Go to definition
- `Cmd+Shift+O` - Go to symbol
- `Cmd+T` - Go to symbol in project
- `F12` - Go to definition (VSCode keymap)

### 3. AI-Assisted Development

**Inline assistance**:
1. Select code
2. `Cmd+?` - Open Agent Panel
3. Use slash commands: `/ui`, `/codegen-assets`
4. Ask questions with full context

**Code generation**:
1. Write a comment describing what you need
2. Use AI to generate implementation
3. Review and refine

### 4. Task Running

Create `.zed/tasks.json`:

```json
[
  {
    "label": "Dev Server",
    "command": "pnpm run dev",
    "use_new_terminal": true,
    "reveal": "always"
  },
  {
    "label": "Run Tests",
    "command": "pnpm test",
    "use_new_terminal": false,
    "hide": "on_success"
  },
  {
    "label": "Lint",
    "command": "pnpm run lint",
    "reveal": "no_focus"
  },
  {
    "label": "Build",
    "command": "pnpm run build"
  }
]
```

**Run tasks**:
- `Cmd+Shift+P` → "task: spawn"
- Select and run
- `Cmd+Shift+R` → Rerun last task

### 5. Git Workflow

**Built-in Git features**:
- View changes: Gutter indicators
- Stage hunks: Click gutter or `do`
- Commit: Command Palette → "git: commit"
- Branch switcher: Status bar

**Git blame**:
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

### 6. Search and Replace

**Project search**: `Cmd+Shift+F` / `Ctrl+Shift+F`

**Regex differences from VSCode**:
- Use `$1` instead of `\1` for capture groups
- Use `()` for groups (not `\(\)`)
- Case insensitive: `(?i)` at start or `Alt+Cmd+C`

**Example**:
```
Find: (function)\s+(\w+)
Replace: const $2 = $1
```

---

## Keyboard Shortcuts

### Essential Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Command Palette | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| Quick Open | `Cmd+P` | `Ctrl+P` |
| Settings | `Cmd+,` | `Ctrl+,` |
| Terminal | `Cmd+J` | `Ctrl+J` |
| AI Assistant | `Cmd+?` | `Ctrl+?` |
| Go to Definition | `Cmd+Click` | `Ctrl+Click` |
| Find in Files | `Cmd+Shift+F` | `Ctrl+Shift+F` |
| Multi-cursor | `Cmd+D` | `Ctrl+D` |
| Comment | `Cmd+/` | `Ctrl+/` |
| Save | `Cmd+S` | `Ctrl+S` |
| Save All | `Cmd+K S` | `Ctrl+K S` |
| Close Tab | `Cmd+W` | `Ctrl+W` |
| New Tab | `Cmd+N` | `Ctrl+N` |
| Split Pane | `Cmd+K` then arrow | `Ctrl+K` then arrow |

### Project-Specific Shortcuts

Add to `.zed/keymap.json`:

```json
[
  {
    "context": "Workspace",
    "bindings": {
      "cmd-shift-t": ["task::Spawn", { "task_name": "Run Tests" }],
      "cmd-shift-b": ["task::Spawn", { "task_name": "Build" }],
      "cmd-shift-l": ["task::Spawn", { "task_name": "Lint" }]
    }
  }
]
```

---

## Advanced Features

### 1. Tasks System

Tasks allow you to run commands with variable substitution.

**Available Variables**:
- `$ZED_FILE` - Current file path
- `$ZED_FILENAME` - Current filename
- `$ZED_DIRNAME` - Current directory
- `$ZED_RELATIVE_FILE` - Relative file path
- `$ZED_WORKTREE_ROOT` - Project root
- `$ZED_SELECTED_TEXT` - Selected text

**Example Task**:

```json
{
  "label": "Run Current File",
  "command": "node",
  "args": ["$ZED_FILE"],
  "reveal": "always"
}
```

### 2. Language Server Configuration

Configure LSP per project:

```json
{
  "lsp": {
    "typescript-language-server": {
      "initialization_options": {
        "preferences": {
          "includeInlayParameterNameHints": "all",
          "includeInlayFunctionParameterTypeHints": true
        }
      }
    }
  }
}
```

### 3. Extensions

Install extensions via Command Palette:
1. `Cmd+Shift+P` → "zed: extensions"
2. Search and install

**Auto-install extensions**:

```json
{
  "auto_install_extensions": {
    "html": true,
    "dockerfile": true,
    "toml": true
  }
}
```

### 4. Snippets

Create custom snippets in settings:

```json
{
  "snippets": {
    "TypeScript": {
      "console.log": {
        "prefix": "cl",
        "body": "console.log('$1:', $1);"
      }
    }
  }
}
```

### 5. Multi-root Workspaces

Open multiple project roots:
1. `File` → `Add Folder to Workspace`
2. Or via CLI: `zed project1 project2`

### 6. Collaboration

Share your editor:
1. Click "Share" button (top right)
2. Copy link
3. Send to collaborators
4. They join in real-time

**Features**:
- See cursors and selections
- Edit simultaneously
- Voice/video chat (beta)
- Follow mode

---

## Troubleshooting

### Common Issues

#### 1. Language Server Not Working

**Solution**:
```bash
# Check LSP status
Cmd+Shift+P → "zed: open log"

# Restart language server
Cmd+Shift+P → "editor: restart language server"
```

#### 2. Slow Performance

**Check**:
- File scan exclusions
- Large files (syntax highlighting)
- Too many open tabs

**Fix**:
```json
{
  "file_scan_exclusions": [
    "**/node_modules",
    "**/.git",
    "**/target",
    "**/.next",
    "**/dist"
  ]
}
```

#### 3. AI Not Responding

**Verify**:
1. API key configured
2. Internet connection
3. Check provider status

**Configure**:
```json
{
  "language_models": {
    "anthropic": {
      "api_url": "https://api.anthropic.com"
    }
  }
}
```

#### 4. Terminal Issues

**Reset terminal**:
```json
{
  "terminal": {
    "shell": "system",
    "env": {},
    "working_directory": "current_project_directory"
  }
}
```

#### 5. Keybindings Not Working

**Debug**:
1. Check keymap conflicts
2. Open default keymap
3. Override in user keymap

```json
{
  "context": "Editor",
  "bindings": {
    "cmd-s": "workspace::Save"
  }
}
```

### Getting Help

1. **Documentation**: [https://zed.dev/docs](https://zed.dev/docs)
2. **Community**: [Zed Discord](https://discord.gg/zed)
3. **GitHub Issues**: [https://github.com/zed-industries/zed/issues](https://github.com/zed-industries/zed/issues)
4. **Forum**: [https://github.com/zed-industries/zed/discussions](https://github.com/zed-industries/zed/discussions)

---

## Quick Reference Card

### Project-Specific Commands

For this project (`ivoire-cours-web1`):

```bash
# Run dev server
pnpm run dev

# Run linter
pnpm run lint

# Generate assets
pnpm run codegen:assets

# Run tests
pnpm test
```

### Slash Commands

In Agent Panel (`Cmd+?` / `Ctrl+?`):

- `/codegen-assets` - Regenerate asset types
- `/ui` - Build SolidJS components

### File Structure

```
.github/
├── prompts/              # Custom AI prompts
│   ├── codegen-assets.prompt.md
│   └── ui.prompt.md
├── copilot-instructions.md  # Commit guidelines
└── docs/
    └── ZED_EDITOR_GUIDE.md  # This file

src/
├── features/             # Start here for new features
│   └── [feature]/front/
└── globals/ui/          # Shared components
    └── cn/              # ⚠️ Don't modify manually
```

### Configuration Files

```
.zed/
├── settings.json    # Project settings
└── tasks.json       # Project tasks

~/.config/zed/
├── settings.json    # Global settings
├── keymap.json      # Key bindings
└── tasks.json       # Global tasks
```

---

## Conclusion

Zed Editor offers a modern, fast, and AI-native development experience. While it may lack some extensions from VSCode, its core features, performance, and built-in capabilities make it an excellent choice for many workflows.

### Next Steps

1. **Install Zed** and configure basic settings
2. **Try custom prompts**: `/codegen-assets` and `/ui`
3. **Set up tasks** for your common commands
4. **Configure AI** with your preferred provider
5. **Customize keymap** for your workflow
6. **Join the community** for tips and updates

### Resources

- **Official Docs**: [https://zed.dev/docs](https://zed.dev/docs)
- **Extensions**: [https://github.com/zed-industries/extensions](https://github.com/zed-industries/extensions)
- **Community**: [Discord](https://discord.gg/zed)
- **This Project**: Read `.github/prompts/` for custom commands

Happy coding with Zed! 🚀