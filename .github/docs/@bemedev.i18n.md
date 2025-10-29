# @bemedev/i18n

A modern, fully-typed internationalization (i18n) library for TypeScript
and JavaScript with a fluent, composable API. Define once, compose per-lo//
Locales are narrowed from machine.keys const call =
machine.translate('greetings', { name: 'A' }).to; // call: (locale?: 'en' |
'es-ES' | 'en-US') => string

````

### Utility types

If you need to extract types from your i18n machine, several utility types
are provided:

```ts
import type {
  ConfigFrom,        // Extract the configuration type
  KeysFrom,          // Extract available locale keys
  TranslationsFrom,  // Extract all translations
  TranslationFrom,   // Extract a single locale translation
  KeyFrom,           // Extract the current locale key
} from '@bemedev/i18n/class';

import type {
  RequiredTranslations,  // Make all translations required
  _Translations,         // Make all translations optional
  _Params,              // Extract parameters for a translation key
  CheckParams,          // Validate parameter requirements
} from '@bemedev/i18n/types';

// Example usage
type Config = ConfigFrom<typeof machine>;
type Locales = KeysFrom<typeof machine>;
type AllTranslations = TranslationsFrom<typeof machine>;
type EnglishTranslation = TranslationFrom<typeof machine>;

// Extract parameters for a specific key
type GreetingParams = _Params<Config, 'greetings'>;
// => { name: string; lastLoginDate: Date }
````

**Note:** Properties prefixed with `__` (like `__key`, `__translation`) are
internal and marked as deprecated. They exist only for type inference and
should not be used at runtime.te safely with strong types.

## Features

- ✅ Strong TypeScript typing for keys and params
- ✅ Simple, fluent API with a class-like builder
- ✅ Formatting helpers: date, number, plural, list, enum
- ✅ Nested structures with dot-path access
- ✅ Locale fallback (en, en-US ➜ en)
- ✅ Zero-deps runtime, tiny footprint

<br/>

## Installation

```bash
# npm
npm install @bemedev/i18n

# yarn
yarn add @bemedev/i18n

# pnpm
pnpm add @bemedev/i18n
```

## Quick start

```ts
import { create } from '@bemedev/i18n';

// Create a machine with a base locale and a default fallback
const machine = create(
  dt => ({
    localee: 'en',
    greetings: 'Hello {name}! Your last login was {lastLoginDate:date}.',
    inboxMessages: dt('Hello {name}, you have {messages:plural}.', {
      plural: { messages: { one: '1 message', other: '{?} messages' } },
    }),
    nested: {
      greetings: dt('Hello {names:list}!', {
        list: { names: { style: 'short' } },
      }),
    },
  }),
  'en',
)
  .provideTranslation('es-ES', dt => ({
    localee: 'es-ES',
    greetings: dt(
      '¡Hola {name}! Tu última conexión fue el {lastLoginDate:date}.',
      {
        date: {
          lastLoginDate: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          },
        },
      },
    ),
  }))
  .provideTranslation('en-US', { localee: 'en-US' });

// Translate
const msg = machine
  .translate('greetings', {
    name: 'John',
    lastLoginDate: new Date('2023-10-01T12:00:00Z'),
  })
  .to('es-ES');
// => "¡Hola John! Tu última conexión fue el 01/10/2023."
```

## API overview

- create(config | define => config, ...fallbacks)
  - Returns an I18n machine with methods:
    - provideTranslation(locale, value | define => value): chain new locale
      entries
    - translate(key, args?).to(locale?): lazy translator returning a string
    - translateWithLocale(locale, { key, args? }): direct translation
      function
    - keys: string[] of known locales
    - translations: resolved map of locale ➜ messages

### Defining translations

You can write plain messages or use `dt` to attach formatting options.

```ts
const machine = create(
  dt => ({
    greetings: 'Hello {name}!',
    status: dt('Order is {status:enum}', {
      enum: { status: { pending: 'pending', shipped: 'shipped' } },
    }),
    lastSeen: dt('Last seen: {date:date}', {
      date: { date: { dateStyle: 'long' } },
    }),
    items: dt('You have {count:plural}', {
      plural: { count: { one: '1 item', other: '{?} items' } },
    }),
    friends: dt('Online: {users:list}', {
      list: { users: { style: 'long', type: 'conjunction' } },
    }),
  }),
  'en',
);
```

### Using translate vs translateWithLocale

```ts
// Lazy: bind key/args, choose locale later
const invite = machine.translate('greetings', { name: 'Ada' });
invite.to('en');
invite.to('es-ES');

// Direct: provide locale immediately
machine.translateWithLocale('en', {
  key: 'greetings',
  args: { name: 'Ada' },
});
```

### Nested keys and arrays

Dot-paths are supported for deep access; non-string values (objects/arrays)
are returned as-is when defined without dt.

```ts
const m = create(
  {
    nested: {
      data: { lang: 'en', langs: ['fr', 'gb', 'es'] },
      someArray: ['string1', 'string2'],
    },
  },
  'en',
);

m.translate('nested.data').to('en'); // => { lang: 'en', langs: ['fr','gb','es'] }
m.translate('nested.someArray').to('en'); // => ['string1', 'string2']
```

## Type safety

Types are inferred from your config and preserved per-locale.

```ts
// Keys and params are type-checked
machine.translate('greetings', {
  name: 'John',
  lastLoginDate: new Date(),
}); // ✅
machine.translate('greetings'); // ❌ missing 'name'
machine.translate('unknown.key'); // ❌ unknown key

// Locales are narrowed from machine.keys
const call = machine.translate('greetings', { name: 'A' }).to;
// // call: (locale?: 'en' | 'es-ES' | 'en-US') => string
```

### Utility types

If you need to extract types from your i18n machine, several utility types
are provided:

```ts
import type {
  ConfigFrom, // Extract the configuration type
  KeysFrom, // Extract available locale keys
  TranslationsFrom, // Extract all translations
  TranslationFrom, // Extract a single locale translation
  KeyFrom, // Extract the current locale key
} from '@bemedev/i18n/class';

import type {
  RequiredTranslations, // Make all translations required
  _Translations, // Make all translations optional
  _Params, // Extract parameters for a translation key
  CheckParams, // Validate parameter requirements
} from '@bemedev/i18n/types';

// Example usage
type Config = ConfigFrom<typeof machine>;
type Locales = KeysFrom<typeof machine>;
type AllTranslations = TranslationsFrom<typeof machine>;
type EnglishTranslation = TranslationFrom<typeof machine>;

// Extract parameters for a specific key
type GreetingParams = _Params<Config, 'greetings'>;
// => { name: string; lastLoginDate: Date }
```

**Note:** Properties prefixed with `__` (like `__key`, `__translation`) are
internal and marked as deprecated. They exist only for type inference and
should not be used at runtime.

---

## Advanced Usage

````

If you want to re-use the machine’s internal types, utility types are
provided:

```ts
import type {
  ConfigFrom,
  KeysFrom,
  KeyFrom, // @deprecated – internal typing only
  TranslationsFrom,
  TranslationFrom, // @deprecated – internal typing only
} from '@bemedev/i18n/class';
````

Note: properties prefixed by ** (like `**key`, `\_\_translation`) are
marked as deprecated and exist only to carry types. Don’t use them at
runtime.

---

## Advanced Usage

### Creating translations from existing configurations

If you want to create a new translation based on an existing configuration
without copying the entire object, use the `translation` helper:

#### Basic usage with `translation`

```ts
import { translation } from '@bemedev/i18n';

const translate = translation(
  {
    greeting: 'Hello',
    farewell: 'Goodbye',
    withParam: 'Hello {name}!',
    nested: {
      welcome: 'Welcome back',
      deep: {
        message: 'Deep message',
      },
    },
  },
  'en',
);

// Simple translations
translate('greeting'); // => 'Hello'
translate('farewell'); // => 'Goodbye'

// With parameters
translate('withParam', { name: 'John' }); // => 'Hello John!'

// Nested keys
translate('nested.welcome'); // => 'Welcome back'
translate('nested.deep.message'); // => 'Deep message'
```

#### Using `translation.derived` for type-safe derived translations

Create translations that derive from an existing configuration while
maintaining full type safety:

```ts
import { translation } from '@bemedev/i18n';
import { machine } from './your-base-config';

const spanishTranslation = translation.derived<typeof machine.config>(
  dt => ({
    localee: 'es-ES',
    greetings: dt(
      '¡Hola {name}! Tu última conexión fue el {lastLoginDate:date}.',
      {
        date: {
          lastLoginDate: {
            month: '2-digit',
            year: 'numeric',
            day: '2-digit',
          },
        },
      },
    ),
    nested: {
      greetings: dt('¡Hola {names:list}!'),
    },
  }),
  'es-ES',
);

// Fully typed translations
spanishTranslation('greetings', {
  name: 'Juan',
  lastLoginDate: new Date('2024-06-15T12:00:00Z'),
});
// => '¡Hola Juan! Tu última conexión fue el 15/06/2024.'
```

#### Using `translation.fromMachine` for machine-based translations

Create translations directly from an existing i18n machine:

```ts
import { translation } from '@bemedev/i18n';
import { machine } from './your-machine';

const germanTranslation = translation.fromMachine<typeof machine>(
  dt => ({
    localee: 'de-DE',
    greetings: dt(
      'Hallo {name}! Deine letzte Anmeldung war {lastLoginDate:date}.',
    ),
    // ... other translations
  }),
  'de-DE',
);
```

### Accessing the configuration

The `translation` function returns an object with a `config` property that
exposes the underlying configuration:

```ts
const translate = translation({ greeting: 'Hello' }, 'en');
console.log(translate.config); // => { greeting: 'Hello' }
```

## Licence

MIT

## _[CHANGE_LOG](https://github.com/chlbri/i18n/blob/main/CHANGE_LOG.md)_

<br/>

## Acknowledgements

Special thanks to all contributors, testers, and users who provided
feedback and helped improve this library. Your support and suggestions are
greatly appreciated!

#### This was inspired by [Web Dev Simplified](https://www.youtube.com/@WebDevSimplified)

The Youtube video that inspired this library can be found
[here](https://www.youtube.com/watch?v=VbZVx13b2oY).

<br/>

## Author

chlbri (bri_lvi@icloud.com)

<br/>

[My github](https://github.com/chlbri?tab=repositories)

[<svg width="98" height="96" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f"/></svg>](https://github.com/chlbri?tab=repositories)

<br/>

## Mainfull Links

- [Documentation](https://github.com/chlbri/i18n)
- [Signal a bug](https://github.com/chlbri/i18n/issues)
