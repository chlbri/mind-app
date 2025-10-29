# Test Generator Prompt

Ce prompt aide à générer des tests unitaires et d'intégration pour le projet.

## Context

Le projet utilise:
- **Framework de test**: Vitest
- **Bibliothèque de test**: @solidjs/testing-library
- **Assertions**: expect de Vitest
- **Mocking**: vi de Vitest
- **Framework**: SolidJS v1.9.9
- **TypeScript**: v5.9.3 (strict mode)

## Structure des tests

Les tests doivent suivre cette structure:

```
src/
├── features/
│   └── [feature-name]/
│       └── front/
│           ├── components/
│           │   ├── UserCard.tsx
│           │   └── UserCard.test.tsx  # Test à côté du composant
│           └── utils/
│               ├── formatters.ts
│               └── formatters.test.ts
│
└── globals/
    └── ui/
        └── molecules/
            ├── Button.tsx
            └── Button.test.tsx
```

## Principes de test

### 1. Tests de composants SolidJS

```typescript
import { render, screen } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(() => <Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(() => <Button onClick={handleClick}>Click</Button>);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(() => <Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2. Tests de fonctions utilitaires

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from './formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('15/01/2024');
    });

    it('handles invalid dates', () => {
      expect(formatDate(null)).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency with correct symbol', () => {
      expect(formatCurrency(1000, 'XOF')).toBe('1 000 XOF');
    });
  });
});
```

### 3. Tests de signaux et state management

```typescript
import { describe, it, expect } from 'vitest';
import { createRoot } from 'solid-js';
import { useAuth } from './auth.signal';

describe('useAuth signal', () => {
  it('initializes with no user', () => {
    createRoot(dispose => {
      const auth = useAuth();
      expect(auth.user()).toBeNull();
      expect(auth.isAuthenticated()).toBe(false);
      dispose();
    });
  });

  it('sets user on login', () => {
    createRoot(dispose => {
      const auth = useAuth();
      const user = { id: '1', name: 'Test User' };
      
      auth.login(user);
      
      expect(auth.user()).toEqual(user);
      expect(auth.isAuthenticated()).toBe(true);
      dispose();
    });
  });
});
```

### 4. Tests d'accessibilité

```typescript
import { render } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(() => <Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Checklist pour un bon test

- [ ] Nom descriptif du test (ce qui est testé + comportement attendu)
- [ ] Arrange-Act-Assert pattern
- [ ] Tests isolés (pas de dépendances entre tests)
- [ ] Mock des dépendances externes (API, localStorage, etc.)
- [ ] Cleanup après chaque test (dispose() pour SolidJS)
- [ ] Tests d'accessibilité pour les composants UI
- [ ] Tests des cas limites et erreurs
- [ ] Coverage > 80% pour les fonctions critiques

## Commandes utiles

```bash
# Lancer tous les tests
pnpm test

# Lancer les tests en mode watch
pnpm test:watch

# Générer le rapport de coverage
pnpm test:coverage

# Lancer les tests d'un fichier spécifique
pnpm test UserCard.test.tsx
```

## Task

Quand ce prompt est invoqué, génère des tests complets pour le fichier ou composant spécifié par l'utilisateur en suivant:

1. **Analyser** le code source pour identifier ce qui doit être testé
2. **Créer** un fichier de test avec le nom `[filename].test.ts(x)`
3. **Couvrir** les cas suivants:
   - Comportement normal (happy path)
   - Cas limites (edge cases)
   - Gestion d'erreurs
   - Accessibilité (pour les composants UI)
4. **Suivre** les conventions du projet
5. **Vérifier** que les imports sont corrects
6. **S'assurer** que les tests sont exécutables

## Output attendu

Afficher uniquement:
1. Le chemin du fichier de test créé
2. Le nombre de tests générés
3. Un résumé des cas couverts

Format:
```
✅ Tests créés: src/features/auth/front/components/LoginForm.test.tsx
📊 12 tests générés
🎯 Coverage: happy path, edge cases, accessibility, errors
```

Pas besoin de commentaires supplémentaires ou de résumé détaillé.