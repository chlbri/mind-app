# Commit Message Generator Prompt

Ce prompt aide à générer des messages de commit conformes aux conventions
du projet.

## Context

Le projet suit des conventions strictes de commit définies dans
`.github/copilot-instructions.md`.

### Types de commit disponibles

- **feat**: nouvelle fonctionnalité (version mineure)
- **fix**: correction de bug (version patch)
- **hot-fix**: correction de bug critique (version patch)
- **docs**: modification/ajout de documentation (version patch)
- **build**: modification des fichiers de build (pas de versionnement)
- **style**: modification du style du code (pas de versionnement)
- **test**: ajout/suppression de tests (version patch)
- **revert**: retour à un commit précédent (version patch)

### Structure du message de commit

```
<type>(<scope>): <titre en anglais>

<corps en français, max 200 mots>

[BREAKING CHANGE] (si applicable)
chlbri: bri_lvi@icloud.com
```

## Règles importantes

1. **Titre** (première ligne):
   - En anglais
   - 50 caractères maximum
   - Impératif présent: "Add", "Fix", "Update"
   - Pas de point final
   - Format: `type(scope): description`

2. **Scope**:
   - Entre parenthèses après le type
   - Nom du module/feature/composant concerné
   - Exemples: `(auth)`, `(ui)`, `(guard)`, `(assets)`

3. **Corps** (optionnel):
   - Ligne vide après le titre
   - En français
   - Maximum 200 mots
   - Explique le POURQUOI, pas le comment
   - Décrit l'impact et le contexte

4. **BREAKING CHANGE** (si applicable):
   - Ajouter `[BREAKING CHANGE]` sur une nouvelle ligne
   - Décrit la rupture de compatibilité

5. **Signature** (OBLIGATOIRE):
   - Toujours ajouter sur la dernière ligne
   - Format exact: `chlbri: bri_lvi@icloud.com`

## Exemples de bons commits

### Feature commit simple

```
feat(auth): Add email verification flow

Ajout d'un système de vérification par email pour les nouveaux utilisateurs.
Le flow inclut l'envoi d'un email avec un lien de confirmation et la validation
du token.

chlbri: bri_lvi@icloud.com
```

### Fix commit

```
fix(ui): Correct button hover state in dark mode

Le hover sur les boutons primaires n'était pas visible en mode sombre.
Ajustement des couleurs pour améliorer le contraste.

chlbri: bri_lvi@icloud.com
```

### Breaking change

```
feat(api): Update authentication API to use JWT tokens

Migration du système d'authentification de sessions vers JWT.
Tous les clients doivent maintenant inclure le token dans les headers.

[BREAKING CHANGE]
chlbri: bri_lvi@icloud.com
```

### Documentation

```
docs(readme): Update installation instructions

Mise à jour des instructions d'installation pour inclure les nouvelles
dépendances et la configuration de l'environnement.

chlbri: bri_lvi@icloud.com
```

### Style commit

```
style(components): Format code with Prettier

Application des règles de formatage Prettier sur tous les composants
de la feature auth.

chlbri: bri_lvi@icloud.com
```

### Test commit

```
test(auth): Add unit tests for login flow

Ajout de tests unitaires couvrant les cas normaux et les erreurs
du processus de connexion.

chlbri: bri_lvi@icloud.com
```

## Mauvais exemples (à éviter)

❌ **Titre en français**

```
feat(auth): Ajout de la connexion
```

❌ **Pas de scope**

```
feat: Add login
```

❌ **Titre trop long**

```
feat(auth): Add a new authentication system with email verification and password reset functionality
```

❌ **Corps trop long (> 200 mots)**

```
feat(auth): Add login

Lorem ipsum dolor sit amet... (300 mots)

chlbri: bri_lvi@icloud.com
```

❌ **Signature manquante ou incorrecte**

```
feat(auth): Add login

Ajout de la connexion utilisateur.
```

❌ **Mauvais impératif**

```
feat(auth): Added login feature
feat(auth): Adding login feature
```

## Task

Quand ce prompt est invoqué:

1. **Analyser** les changements effectués (staging area)
2. **Identifier** le type de commit approprié
3. **Déterminer** le scope principal
4. **Générer** un message de commit suivant EXACTEMENT le format ci-dessus
5. **Vérifier** que toutes les règles sont respectées

## Questions à se poser

- Quel est le type de changement? (feat, fix, docs, etc.)
- Quel module/feature est impacté? (scope)
- Quelle est la description la plus concise en anglais?
- Pourquoi ce changement est nécessaire? (corps en français)
- Y a-t-il un breaking change?

## Output attendu

Afficher uniquement le message de commit formaté, prêt à être copié-collé.

Format:

```
type(scope): Description courte en anglais

Corps explicatif en français si nécessaire.

[BREAKING CHANGE] (si applicable)
chlbri: bri_lvi@icloud.com
```

Pas de commentaires avant ou après. Juste le message de commit.
