# Exemples : Cards et Comments

Ce guide montre comment gérer les cartes Trello et ajouter des commentaires.

## 🃏 Gestion des Cards

### Lister les cartes d'une colonne

Utilisez `list_trello_cards` :

```
Question: Montre-moi toutes les cartes dans la colonne "En cours"
```

**Workflow:**
1. Récupère l'ID de la list avec `list_trello_lists`
2. Appelle `list_trello_cards` avec le `listId`

**Réponse:**
```json
[
  {
    "id": "65a1b2c3d4e5f6789abc1111",
    "name": "Développer API authentification",
    "desc": "Implémenter OAuth2 avec Google et GitHub",
    "idList": "65a1b2c3d4e5f6789abc0002",
    "url": "https://trello.com/c/AbC123",
    "closed": false,
    "due": "2025-12-31T23:59:59.999Z",
    "labels": [
      {"name": "P1 - Critique", "color": "red"}
    ]
  }
]
```

### Créer une nouvelle carte

Utilisez `create_trello_card` :

```
Question: Crée une carte "Refactoring base de données" dans la colonne Backlog avec description "Optimiser les requêtes SQL et ajouter indexes"
```

**Outil appelé:**
```json
{
  "name": "create_trello_card",
  "arguments": {
    "listId": "65a1b2c3d4e5f6789abc0001",
    "name": "Refactoring base de données",
    "desc": "Optimiser les requêtes SQL et ajouter indexes"
  }
}
```

### Mettre à jour une carte

#### Modifier le nom

Utilisez `update_card_name` :

```
Question: Renomme la carte "API auth" en "API authentification complète"
```

**Outil:**
```json
{
  "name": "update_card_name",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111",
    "name": "API authentification complète"
  }
}
```

#### Modifier la description

Utilisez `update_card_description` :

```
Question: Met à jour la description de la carte pour ajouter "Utiliser JWT pour les tokens"
```

**Outil:**
```json
{
  "name": "update_card_description",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111",
    "description": "Implémenter OAuth2 avec Google et GitHub\n\nUtiliser JWT pour les tokens"
  }
}
```

### Déplacer une carte

Utilisez `move_trello_card` :

```
Question: Déplace la carte "API authentification" de Backlog vers En cours
```

**Outil:**
```json
{
  "name": "move_trello_card",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111",
    "targetListId": "65a1b2c3d4e5f6789abc0002",
    "position": "top"
  }
}
```

**Positions possibles:**
- `"top"` - En haut de la colonne
- `"bottom"` - En bas de la colonne
- `12345` - Position numérique spécifique

### Archiver une carte

Utilisez `archive_card` (recommandé plutôt que delete) :

```
Question: Archive la carte terminée "Refactoring BDD"
```

**Outil:**
```json
{
  "name": "archive_card",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111"
  }
}
```

### Désarchiver une carte

Utilisez `unarchive_card` :

```
Question: Désarchive la carte "Migration serveur" car elle n'est pas terminée
```

**Outil:**
```json
{
  "name": "unarchive_card",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111"
  }
}
```

### Supprimer une carte (IRRÉVERSIBLE)

⚠️ **Attention**: Utilisez `delete_card` uniquement si nécessaire !

```
Question: Supprime définitivement la carte spam
```

**Outil:**
```json
{
  "name": "delete_card",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111"
  }
}
```

## 💬 Commentaires

### Ajouter un commentaire

Utilisez `add_card_comment` :

```
Question: Ajoute un commentaire "Tests unitaires terminés ✅" à la carte API authentification
```

**Outil:**
```json
{
  "name": "add_card_comment",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111",
    "text": "Tests unitaires terminés ✅"
  }
}
```

## 🔍 Recherche de cartes

Utilisez `search_trello_cards` :

```
Question: Trouve toutes les cartes qui contiennent "API" ou "authentification"
```

**Outil:**
```json
{
  "name": "search_trello_cards",
  "arguments": {
    "query": "API authentification",
    "limit": 25
  }
}
```

**Recherche avancée:**

```json
{
  "query": "name:\"Bug\" is:open",
  "boardIds": ["507f1f77bcf86cd799439011"],
  "partial": true
}
```

## 🎯 Cas d'usage pratiques

### Workflow de développement

```
1. Créer carte "Feature X" dans Backlog
2. Ajouter description détaillée
3. Ajouter label P1
4. Définir date limite
5. Déplacer en "En cours"
6. Ajouter commentaires de progression
7. Déplacer en "Terminé"
8. Archiver après validation
```

### Gestion de bugs

```
1. Créer carte "Bug: connexion échoue"
2. Label "Bug" rouge
3. Priority P1
4. Commentaire: "Reproduction: cliquer login sans email"
5. Déplacer en "En cours" quand pris en charge
6. Commentaire: "Fix déployé en staging"
7. Déplacer en "Terminé"
```

### Sprint planning

```
1. Rechercher cartes "sprint:Q1"
2. Filtrer par labels priorité
3. Déplacer top 10 vers "Sprint actuel"
4. Ajouter dates limites (fin de sprint)
5. Suivre progression avec commentaires
```

---

**Prochains exemples:** [Labels et Priorités](./03-labels-and-priorities.md)
