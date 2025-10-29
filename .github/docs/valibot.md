# Valibot - Documentation

## Introduction

Valibot est une bibliothèque de validation de schémas modulaire et
type-safe pour TypeScript. Elle permet de valider des données facilement en
utilisant un schéma, que ce soit pour des données entrantes sur un serveur,
un formulaire ou même des fichiers de configuration.

### Points clés

- **Entièrement type-safe** avec inférence de type statique
- **Taille de bundle réduite** à partir de moins de 700 bytes
- **Validation universelle** de chaînes de caractères aux objets complexes
- **Open source** et entièrement testé avec 100% de couverture
- **Nombreuses actions** de transformation et validation incluses
- **Code source bien structuré** sans dépendances
- **API minimale** lisible et bien pensée

### Liens utiles

- [Site officiel](https://valibot.dev/)
- [GitHub](https://github.com/fabian-hiller/valibot)
- [Discord](https://discord.gg/tkMjQACf2P)
- [Article d'annonce](https://www.builder.io/blog/introducing-valibot)
- [Thèse de Bachelor](https://valibot.dev/thesis.pdf)

## Installation

```bash
# npm
npm install valibot

# pnpm
pnpm add valibot

# yarn
yarn add valibot
```

## Exemple de base

```typescript
import * as v from 'valibot'; // 1.31 kB

// Créer un schéma de connexion avec email et mot de passe
const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

// Inférer le type TypeScript du schéma
// { email: string; password: string }
type LoginData = v.InferOutput<typeof LoginSchema>;

// Lance une erreur pour email et password
const output1 = v.parse(LoginSchema, { email: '', password: '' });

// Retourne les données validées
const output2 = v.parse(LoginSchema, {
  email: 'jane@example.com',
  password: '12345678',
});
```

## Comparaison avec Zod

Au lieu de s'appuyer sur quelques grandes fonctions avec de nombreuses
méthodes, l'API de Valibot est basée sur de nombreuses petites fonctions
indépendantes, chacune avec une seule tâche. Cette conception modulaire
présente plusieurs avantages :

- **Réduction du bundle** : Le bundler peut supprimer le code non utilisé
  grâce aux imports. Cela peut réduire la taille du bundle jusqu'à **95%
  par rapport à Zod**.
- **Extensibilité** : Facile d'étendre les fonctionnalités avec du code
  externe
- **Robustesse** : Le code source est plus robuste car les fonctions
  peuvent être testées individuellement

## Schémas

### Valeurs primitives

Valibot supporte la création de schémas pour tous les types de données
primitifs :

```typescript
import * as v from 'valibot';

const BigintSchema = v.bigint(); // bigint
const BooleanSchema = v.boolean(); // boolean
const NullSchema = v.null(); // null
const NumberSchema = v.number(); // number
const StringSchema = v.string(); // string
const SymbolSchema = v.symbol(); // symbol
const UndefinedSchema = v.undefined(); // undefined
```

### Valeurs complexes

```typescript
import * as v from 'valibot';

// Tableaux
const ArraySchema = v.array(v.string()); // string[]

// Objets
const ObjectSchema = v.object({
  key: v.string(),
}); // { key: string }

const LooseObjectSchema = v.looseObject({
  key: v.string(),
}); // { key: string } + propriétés supplémentaires autorisées

const StrictObjectSchema = v.strictObject({
  key: v.string(),
}); // { key: string } strictement

// Tuples
const TupleSchema = v.tuple([v.string(), v.number()]); // [string, number]

// Records
const RecordSchema = v.record(v.string(), v.number()); // Record<string, number>

// Maps et Sets
const MapSchema = v.map(v.string(), v.number()); // Map<string, number>
const SetSchema = v.set(v.number()); // Set<number>

// Autres types
const DateSchema = v.date(); // Date
const BlobSchema = v.blob(); // Blob
const FileSchema = v.file(); // File
const PromiseSchema = v.promise(); // Promise<unknown>
const FunctionSchema = v.function(); // (...args: unknown[]) => unknown
```

### Cas spéciaux

```typescript
import * as v from 'valibot';

// Littéraux
const LiteralSchema = v.literal('foo'); // 'foo'

// Énumérations
enum Direction { Up, Down, Left, Right }
const EnumSchema = v.enum(Direction); // Direction

// Picklist (alternative à enum)
const PicklistSchema = v.picklist(['a', 'b']); // 'a' | 'b'

// Union
const UnionSchema = v.union([v.string(), v.number()]); // string | number

// Variant (union discriminée)
const VariantSchema = v.variant('type', [
  v.object({ type: v.literal('a'), foo: v.string() }),
  v.object({ type: v.literal('b'), bar: v.number() }),
]); // { type: 'a'; foo: string } | { type: 'b'; bar: number }

// Intersection
const IntersectSchema = v.intersect([
  v.string(),
  v.literal('a')
]); // string & 'a'

// Optionnel et nullable
const OptionalSchema = v.optional(v.string());     // string | undefined
const NullableSchema = v.nullable(v.string());     // string | null
const NullishSchema = v.nullish(v.string());       // string | null | undefined
const UndefinedableSchema = v.undefinedable(v.string()); // string | undefined

// Transformations
const NonNullableSchema = v.nonNullable(v.nullable(v.string())); // string
const NonNullishSchema = v.nonNullish(v.nullish(v.string()));   // string
const NonOptionalSchema = v.nonOptional(v.optional(v.string())); // string

// Autres
const AnySchema = v.any();         // any
const UnknownSchema = v.unknown(); // unknown
const NeverSchema = v.never();     // never
const VoidSchema = v.void();       // void
const NanSchema = v.nan();         // NaN

// Custom
const CustomSchema = v.custom<\`\${number}px\`>(isPixelString); // `${number}px`

// Lazy (pour schémas récursifs)
const LazySchema = v.lazy(() => v.string()); // string

// Instance
const InstanceSchema = v.instance(Error); // Error
```

## Pipelines

Les pipelines permettent d'appliquer des validations et transformations sur
les données :

```typescript
import * as v from 'valibot';

// Validation de chaîne avec plusieurs contraintes
const EmailSchema = v.pipe(
  v.string(),
  v.nonEmpty("L'email est requis"),
  v.email("Format d'email invalide"),
  v.maxLength(100, 'Email trop long'),
);

// Transformation
const TrimmedString = v.pipe(v.string(), v.trim(), v.toLowerCase());

// Validation de nombre
const PositiveInteger = v.pipe(
  v.number(),
  v.integer('Doit être un entier'),
  v.minValue(1, 'Doit être positif'),
);
```

## Actions de validation

### Actions pour chaînes

```typescript
import * as v from 'valibot';

v.email(); // Valide un email
v.url(); // Valide une URL
v.uuid(); // Valide un UUID
v.nanoid(); // Valide un nanoid
v.cuid2(); // Valide un CUID2
v.ulid(); // Valide un ULID
v.regex(/pattern/); // Valide avec une regex
v.length(10); // Longueur exacte
v.minLength(5); // Longueur minimale
v.maxLength(100); // Longueur maximale
v.includes('text'); // Contient
v.startsWith('pre'); // Commence par
v.endsWith('suf'); // Termine par
v.emoji(); // Est un emoji
v.digits(); // Uniquement des chiffres
v.decimal(); // Nombre décimal en chaîne
v.hexadecimal(); // Hexadécimal
v.base64(); // Base64
v.slug(); // Slug valide
v.ip(); // Adresse IP
v.ipv4(); // IPv4
v.ipv6(); // IPv6
v.mac(); // Adresse MAC
```

### Actions pour nombres

```typescript
import * as v from 'valibot';

v.integer(); // Est un entier
v.safeInteger(); // Est un entier sûr
v.finite(); // Est fini
v.minValue(0); // Valeur minimale
v.maxValue(100); // Valeur maximale
v.multipleOf(5); // Multiple de
v.notValue(0); // Pas égal à
```

### Actions de transformation

```typescript
import * as v from 'valibot';

// Chaînes
v.trim(); // Supprime les espaces
v.trimStart(); // Supprime les espaces au début
v.trimEnd(); // Supprime les espaces à la fin
v.toLowerCase(); // En minuscules
v.toUpperCase(); // En majuscules
v.normalize(); // Normalise Unicode

// Nombres
v.toMinValue(0); // Ajuste au minimum
v.toMaxValue(100); // Ajuste au maximum

// Tableaux
v.mapItems(fn); // Map sur les éléments
v.filterItems(fn); // Filtre les éléments
v.sortItems(fn); // Trie les éléments
v.reduceItems(fn); // Réduit les éléments
v.findItem(fn); // Trouve un élément

// Personnalisé
v.transform(fn); // Transformation personnalisée
```

## Méthodes de parsing

### parse

Lance une exception en cas d'erreur :

```typescript
import * as v from 'valibot';

const Schema = v.object({
  name: v.string(),
  age: v.number(),
});

try {
  const data = v.parse(Schema, unknownData);
  console.log(data); // Type-safe
} catch (error) {
  console.error(error);
}
```

### safeParse

Retourne un résultat sans exception :

```typescript
import * as v from 'valibot';

const result = v.safeParse(Schema, unknownData);

if (result.success) {
  console.log(result.output); // Type-safe
} else {
  console.log(result.issues); // Erreurs de validation
}
```

### is (type guard)

Vérifie le type sans parser :

```typescript
import * as v from 'valibot';

if (v.is(Schema, unknownData)) {
  // unknownData est maintenant du type correct
  console.log(unknownData.name);
}
```

### assert

Assert avec type narrowing :

```typescript
import * as v from 'valibot';

v.assert(Schema, unknownData);
// unknownData est maintenant du type correct
console.log(unknownData.name);
```

## Méthodes pour schémas

### fallback

Fournit une valeur par défaut en cas d'erreur :

```typescript
import * as v from 'valibot';

const StringSchema = v.fallback(v.string(), 'hello');
const output = v.parse(StringSchema, 123); // 'hello'
```

### config

Configure le schéma avec des options :

```typescript
import * as v from 'valibot';

const Schema = v.config(v.string(), {
  message: 'Doit être une chaîne',
  abortEarly: true,
});
```

### message

Définit un message d'erreur personnalisé :

```typescript
import * as v from 'valibot';

const Schema = v.message(v.string(), 'Doit être une chaîne');
```

## Méthodes pour objets

### partial

Rend toutes les propriétés optionnelles :

```typescript
import * as v from 'valibot';

const Schema = v.object({
  name: v.string(),
  age: v.number(),
});

const PartialSchema = v.partial(Schema);
// { name?: string; age?: number }
```

### required

Rend toutes les propriétés requises :

```typescript
import * as v from 'valibot';

const Schema = v.object({
  name: v.optional(v.string()),
  age: v.optional(v.number()),
});

const RequiredSchema = v.required(Schema);
// { name: string; age: number }
```

### pick

Sélectionne certaines propriétés :

```typescript
import * as v from 'valibot';

const Schema = v.object({
  name: v.string(),
  age: v.number(),
  email: v.string(),
});

const PickedSchema = v.pick(Schema, ['name', 'email']);
// { name: string; email: string }
```

### omit

Exclut certaines propriétés :

```typescript
import * as v from 'valibot';

const OmittedSchema = v.omit(Schema, ['age']);
// { name: string; email: string }
```

### keyof

Obtient les clés d'un objet :

```typescript
import * as v from 'valibot';

const KeySchema = v.keyof(Schema);
// 'name' | 'age' | 'email'
```

## Inférence de types

### InferOutput

Infère le type de sortie d'un schéma :

```typescript
import * as v from 'valibot';

const Schema = v.object({
  name: v.string(),
  age: v.pipe(v.string(), v.transform(Number)),
});

type Output = v.InferOutput<typeof Schema>;
// { name: string; age: number }
```

### InferInput

Infère le type d'entrée d'un schéma :

```typescript
import * as v from 'valibot';

type Input = v.InferInput<typeof Schema>;
// { name: string; age: string }
```

## Gestion des erreurs

### flatten

Aplatit les erreurs pour un affichage plus simple :

```typescript
import * as v from 'valibot';

const result = v.safeParse(Schema, data);

if (!result.success) {
  const flatErrors = v.flatten(result.issues);
  console.log(flatErrors.nested);
  /*
  {
    name: ['Message d\'erreur'],
    age: ['Message d\'erreur']
  }
  */
}
```

### forward

Redirige une erreur vers un champ spécifique :

```typescript
import * as v from 'valibot';

const RegisterSchema = v.pipe(
  v.object({
    password1: v.string(),
    password2: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [['password1'], ['password2']],
      input => input.password1 === input.password2,
      'Les mots de passe ne correspondent pas',
    ),
    ['password2'], // Erreur affichée sur password2
  ),
);
```

## Métadonnées

### description

Ajoute une description au schéma :

```typescript
import * as v from 'valibot';

const Schema = v.pipe(
  v.string(),
  v.description("Adresse email de l'utilisateur"),
);
```

### title

Ajoute un titre au schéma :

```typescript
import * as v from 'valibot';

const Schema = v.pipe(v.string(), v.title('Email'));
```

### metadata

Ajoute des métadonnées personnalisées :

```typescript
import * as v from 'valibot';

const Schema = v.pipe(v.string(), v.metadata({ custom: 'value' }));
```

## Schémas asynchrones

Valibot supporte la validation asynchrone :

```typescript
import * as v from 'valibot';

const AsyncSchema = v.pipeAsync(
  v.string(),
  v.checkAsync(async value => {
    const exists = await checkEmailExists(value);
    return !exists;
  }, 'Email déjà utilisé'),
);

const result = await v.parseAsync(AsyncSchema, email);
```

## Bonnes pratiques

### 1. Utiliser pipe pour les validations

```typescript
// ✅ Bon
const EmailSchema = v.pipe(v.string(), v.email(), v.maxLength(100));

// ❌ Éviter
const EmailSchema = v.string(); // Pas de validation
```

### 2. Définir des messages d'erreur clairs

```typescript
// ✅ Bon
const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8, 'Le mot de passe doit contenir au moins 8 caractères'),
);

// ❌ Éviter
const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8), // Message par défaut
);
```

### 3. Réutiliser les schémas

```typescript
// ✅ Bon
const EmailSchema = v.pipe(v.string(), v.email());

const UserSchema = v.object({
  email: EmailSchema,
  confirmEmail: EmailSchema,
});

// ❌ Éviter - duplication
const UserSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  confirmEmail: v.pipe(v.string(), v.email()),
});
```

### 4. Utiliser safeParse pour la validation utilisateur

```typescript
// ✅ Bon - pour les données utilisateur
const result = v.safeParse(Schema, userInput);
if (!result.success) {
  // Gérer les erreurs
}

// ✅ Bon - pour les données internes (où les erreurs sont inattendues)
const data = v.parse(Schema, internalData);
```

### 5. Typage avec InferOutput

```typescript
// ✅ Bon
const UserSchema = v.object({
  name: v.string(),
  age: v.number(),
});

type User = v.InferOutput<typeof UserSchema>;

// ❌ Éviter - duplication
type User = {
  name: string;
  age: number;
};
```

## Exemples avancés

### Validation conditionnelle avec variant

```typescript
import * as v from 'valibot';

const PaymentSchema = v.variant('method', [
  v.object({
    method: v.literal('card'),
    cardNumber: v.pipe(v.string(), v.creditCard()),
    cvv: v.pipe(v.string(), v.length(3)),
  }),
  v.object({
    method: v.literal('paypal'),
    email: v.pipe(v.string(), v.email()),
  }),
  v.object({
    method: v.literal('bank'),
    iban: v.pipe(v.string(), v.length(27)),
  }),
]);
```

### Schéma récursif avec lazy

```typescript
import * as v from 'valibot';

type Category = {
  name: string;
  subcategories?: Category[];
};

const CategorySchema: v.GenericSchema<Category> = v.object({
  name: v.string(),
  subcategories: v.optional(v.array(v.lazy(() => CategorySchema))),
});
```

### Validation de formulaire complexe

```typescript
import * as v from 'valibot';

const RegistrationSchema = v.pipe(
  v.object({
    username: v.pipe(
      v.string(),
      v.minLength(3, 'Au moins 3 caractères'),
      v.maxLength(20, 'Maximum 20 caractères'),
      v.regex(/^[a-zA-Z0-9_]+$/, 'Caractères alphanumériques uniquement'),
    ),
    email: v.pipe(
      v.string(),
      v.nonEmpty('Email requis'),
      v.email('Email invalide'),
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8, 'Au moins 8 caractères'),
      v.regex(/[A-Z]/, 'Au moins une majuscule'),
      v.regex(/[0-9]/, 'Au moins un chiffre'),
    ),
    confirmPassword: v.string(),
    terms: v.literal(true, 'Vous devez accepter les conditions'),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      input => input.password === input.confirmPassword,
      'Les mots de passe ne correspondent pas',
    ),
    ['confirmPassword'],
  ),
);
```

## Ressources

- [Documentation officielle](https://valibot.dev/)
- [API Reference](https://valibot.dev/api/)
- [Guides](https://valibot.dev/guides/introduction/)
- [Playground](https://valibot.dev/playground/)
- [GitHub](https://github.com/fabian-hiller/valibot)
- [Discord](https://discord.gg/tkMjQACf2P)

## Licence

Valibot est sous licence
[MIT](https://github.com/fabian-hiller/valibot/blob/main/LICENSE.md) et
totalement gratuit.
