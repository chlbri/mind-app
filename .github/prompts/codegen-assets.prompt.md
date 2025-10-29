# Codegen Assets Prompt

## Action

**Always** Run the command to regenerate the assets file:

```bash
pnpm run codegen:assets
```

## What it does

This command automatically updates `src/globals/types/assets.ts` to reflect
the current structure of the `public/` folder by:

1. Scanning the `public/` folder recursively (excluding system files like
   `.DS_Store`)
2. Generating the `ASSETS` constant with nested objects mirroring the
   folder structure
3. Converting file names to camelCase for property names

## Naming Conventions Applied

- **Folders**: camelCase (e.g., `Accordion horizontal` →
  `accordionHorizontal`)
- **Files**: camelCase without extension (e.g., `logo-texte.png` →
  `logoTexte`)
- **Special characters**: Replaced with camelCase (e.g.,
  `logo-texte.no-background.png` → `logoTexteNoBackground`)
- **Duplicate filenames**: Full filename with extension in quotes (e.g.,
  `'building.jpg'` and `'building.png'`)

## Related Files

- Source: `public/` folder
- Target: `src/globals/types/assets.ts`
- Script: `.github/scripts/generate-assets.mjs`

## NB

No need **comment** at end of the run. No need to **resume** things that it
does. Just make sure to log the number of assets found, like so:

```
📊 Found X assets
```
