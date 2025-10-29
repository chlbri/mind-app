# Shadcn Solid

## Vue d'ensemble

Shadcn Solid est une collection de composants d'interface utilisateur
réutilisables et accessibles, conçus spécifiquement pour SolidJS. Inspiré
par shadcn/ui pour React, il offre des composants de haute qualité avec un
style cohérent et une personnalisation facile.

## Caractéristiques principales

### Composants accessibles

- **Accessibilité** : Conformité WCAG 2.1 et ARIA
- **Clavier** : Navigation au clavier complète
- **Screen readers** : Support des lecteurs d'écran

### Design système cohérent

- **Thème unifié** : Palette de couleurs et typographie cohérentes
- **Variants** : Différentes variantes pour chaque composant
- **Tailles** : Système de tailles flexible

### Personnalisable

- **CSS personnalisé** : Variables CSS pour la personnalisation
- **Tailwind CSS** : Intégration parfaite avec Tailwind
- **TypeScript** : Typage complet

## Installation

### Prérequis

```bash
# Assurez-vous d'avoir ces dépendances
npm install solid-js @tanstack/solid-router tailwindcss @tailwindcss/vite
```

### Installation de shadcn-solid

```bash
# Initialiser shadcn-solid
npx shadcn-solid@latest init

# Installer des composants spécifiques
npx shadcn-solid@latest add button
npx shadcn-solid@latest add input
npx shadcn-solid@latest add card
```

## Configuration

### Configuration Tailwind

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... autres couleurs
      },
    },
  },
  plugins: [],
};
```

### Variables CSS

```css
/* src/index.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... autres variables dark mode */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Composants principaux

### Button

```tsx
import { Button } from '@/components/ui/button';

function MyComponent() {
  return (
    <div className="space-x-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
```

### Input

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function FormComponent() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  );
}
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function ProductCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Title</CardTitle>
        <CardDescription>Product description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Product content and details</p>
      </CardContent>
    </Card>
  );
}
```

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            Dialog description and content
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
```

### Form avec validation

```tsx
import { createForm } from '@tanstack/solid-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const form = createForm(() => ({
    validatorAdapter: zodValidator(),
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      // Handle form submission
      console.log(value);
    },
  }));

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
        validators={{
          onChange: formSchema.shape.email,
        }}
        children={field => (
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-sm">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      />

      <form.Field
        name="password"
        validators={{
          onChange: formSchema.shape.password,
        }}
        children={field => (
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={field.state.value}
              onChange={e => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-sm">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      />

      <form.Subscribe
        selector={state => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting ? '...' : 'Submit'}
          </Button>
        )}
      />
    </form>
  );
}
```

## Thème et personnalisation

### Mode sombre

```tsx
// src/lib/theme.ts
import { createSignal } from 'solid-js';

export const [theme, setTheme] = createSignal<'light' | 'dark'>('light');

export const toggleTheme = () => {
  setTheme(theme() === 'light' ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark');
};
```

### Utilisation du thème

```tsx
import { Button } from '@/components/ui/button';
import { theme, toggleTheme } from '@/lib/theme';

function ThemeToggle() {
  return (
    <Button variant="outline" size="sm" onClick={toggleTheme}>
      Toggle {theme() === 'light' ? 'Dark' : 'Light'} Mode
    </Button>
  );
}
```

## Avantages

1. **Accessibilité** : Composants accessibles par défaut
2. **Performance** : Optimisés pour SolidJS
3. **Personnalisable** : Variables CSS pour la personnalisation
4. **Cohérent** : Design système unifié
5. **TypeScript** : Support TypeScript complet

## Écosystème

- **SolidJS** : Framework de base
- **Tailwind CSS** : Framework CSS
- **Radix UI** : Primitives d'interface accessibles
- **TanStack Form** : Gestion des formulaires
- **Zod** : Validation des schémas

## Composants disponibles

### Layout

- `Accordion`
- `Collapsible`
- `Separator`
- `Sheet`
- `Sidebar`

### Formulaires

- `Button`
- `Checkbox`
- `Input`
- `Label`
- `RadioGroup`
- `Select`
- `Textarea`

### Feedback

- `Alert`
- `Dialog`
- `Drawer`
- `Popover`
- `Toast`

### Navigation

- `Breadcrumb`
- `NavigationMenu`
- `Pagination`
- `Tabs`

### Affichage

- `Avatar`
- `Badge`
- `Card`
- `Table`

## Ressources

- [Documentation officielle](https://www.shadcn-solid.com/)
- [Guide d'installation](https://www.shadcn-solid.com/docs/installation)
- [Composants](https://www.shadcn-solid.com/docs/components)
- [GitHub](https://github.com/hngngn/shadcn-solid)
