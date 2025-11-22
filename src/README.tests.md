# Tests Documentation

## Vue d'ensemble

Ce projet utilise **Vitest** pour les tests unitaires. La suite de tests couvre:

- **TrelloClient** (27 tests) - Toutes les opérations API Trello
- **TypeScript Types** (9 tests) - Validation des types et interfaces

## Statistiques

- **Total**: 36 tests
- **Couverture**: Boards, Lists, Cards, Labels, Dates, Comments
- **Durée**: ~300ms

## Scripts disponibles

```bash
# Exécuter tous les tests (mode CI)
npm test

# Mode watch (relance automatique)
npm run test:watch

# Interface UI interactive
npm run test:ui

# Rapport de couverture
npm run test:coverage
```

## Structure des tests

```
src/
├── trello-client.test.ts    # Tests API Trello (27 tests)
├── types.test.ts            # Tests TypeScript (9 tests)
└── README.tests.md          # Cette documentation
```

## Tests par catégorie

### trello-client.test.ts

**Constructor (2 tests)**

- Validation API key requise
- Validation API token requis

**Board Operations (3 tests)**

- `getBoards()` - Liste des boards
- `createBoard()` - Création board
- `getBoard()` - Récupération board par ID

**List Operations (2 tests)**

- `getLists()` - Liste des colonnes
- `createList()` - Création colonne

**Card Operations (8 tests)**

- `getCards()` - Liste des cartes
- `createCard()` - Création carte
- `updateCard()` - Mise à jour carte
- `archiveCard()` - Archivage carte
- `unarchiveCard()` - Désarchivage carte
- `deleteCard()` - Suppression carte
- `moveCard()` - Déplacement carte
- `searchCards()` - Recherche cartes

**Label Operations (5 tests)**

- `getLabels()` - Liste des labels
- `createLabel()` - Création label
- `updateLabel()` - Mise à jour label
- `addLabelToCard()` - Ajout label à carte
- `removeLabelFromCard()` - Retrait label de carte

**Due Date Operations (4 tests)**

- `setCardDueDate()` - Définir date limite
- `removeCardDueDate()` - Supprimer date limite
- `markDueDateComplete()` - Marquer comme terminé
- `getCardsByDueDate()` - Liste triée par date

**Comment Operations (2 tests)**

- `addComment()` - Ajout commentaire
- `getComments()` - Liste commentaires

### types.test.ts

**Type Validation (9 tests)**

- `TrelloBoard` - Structure board
- `TrelloList` - Structure list
- `TrelloCard` - Structure carte (base, avec date, avec labels)
- `TrelloLabel` - Structure label
- `CardPosition` - Positions valides (top/bottom/numeric)

## Exemple d'exécution

```bash
$ npm test

 RUN  v4.0.9 /Volumes/PS2000W/Autre_Logiciels/MCP/Trello_MCP

 ✓ src/types.test.ts (9 tests) 3ms
 ✓ src/trello-client.test.ts (27 tests) 9ms

 Test Files  2 passed (2)
      Tests  36 passed (36)
   Duration  284ms
```

## Mocking Strategy

Les tests utilisent **vi.mock('axios')** pour simuler les appels API Trello:

```typescript
import { vi } from 'vitest';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);
```

Cela permet de tester la logique sans faire de vraies requêtes HTTP.

## Maintenance

### Ajouter un nouveau test

1. Créer ou éditer un fichier `*.test.ts` dans `src/`
2. Importer les dépendances Vitest:
   ```typescript
   import { describe, it, expect } from 'vitest';
   ```
3. Écrire les tests avec la structure:
   ```typescript
   describe('Feature', () => {
     it('should do something', () => {
       expect(result).toBe(expected);
     });
   });
   ```
4. Exécuter `npm test` pour valider

### Vérifier la couverture

```bash
npm run test:coverage
```

Génère un rapport HTML dans `coverage/index.html`.

## CI/CD Integration

Les tests peuvent être intégrés dans GitHub Actions:

```yaml
- name: Run tests
  run: npm test
```

---

**Documentation générée pour Trello MCP Server v1.5.0**
