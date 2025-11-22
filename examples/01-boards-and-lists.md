# Exemples : Boards et Lists

Ce guide montre comment utiliser les outils MCP pour gérer les boards et lists Trello.

## 📋 Boards

### Lister tous vos boards

Utilisez `list_trello_boards` pour voir tous les boards accessibles :

```
Question: Montre-moi tous mes boards Trello
```

**Réponse attendue:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Roadmap Produit 2025",
    "url": "https://trello.com/b/AbCdEfGh"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Projet Client XYZ",
    "url": "https://trello.com/b/IjKlMnOp"
  }
]
```

### Créer un nouveau board

Utilisez `create_trello_board` avec nom et description :

```
Question: Crée un board Trello "Sprint Q1 2025" avec description "Planification sprints janvier-mars"
```

**Outil appelé:**
```json
{
  "name": "create_trello_board",
  "arguments": {
    "name": "Sprint Q1 2025",
    "desc": "Planification sprints janvier-mars"
  }
}
```

**Réponse:**
```json
{
  "id": "65a1b2c3d4e5f6789abc0123",
  "name": "Sprint Q1 2025",
  "desc": "Planification sprints janvier-mars",
  "url": "https://trello.com/b/XyZ123"
}
```

## 📊 Lists (Colonnes)

### Lister les colonnes d'un board

Utilisez `list_trello_lists` avec l'ID du board :

```
Question: Montre-moi les colonnes du board "Roadmap Produit 2025"
```

**Étapes:**
1. Récupère d'abord l'ID du board avec `list_trello_boards`
2. Appelle `list_trello_lists` avec le `boardId`

**Réponse:**
```json
[
  {
    "id": "65a1b2c3d4e5f6789abc0001",
    "name": "📋 Backlog",
    "idBoard": "507f1f77bcf86cd799439011",
    "closed": false,
    "pos": 1
  },
  {
    "id": "65a1b2c3d4e5f6789abc0002",
    "name": "🚧 En cours",
    "idBoard": "507f1f77bcf86cd799439011",
    "closed": false,
    "pos": 2
  },
  {
    "id": "65a1b2c3d4e5f6789abc0003",
    "name": "✅ Terminé",
    "idBoard": "507f1f77bcf86cd799439011",
    "closed": false,
    "pos": 3
  }
]
```

### Créer une nouvelle colonne

Utilisez `create_trello_list` :

```
Question: Ajoute une colonne "🔍 En revue" au board Roadmap Produit
```

**Outil appelé:**
```json
{
  "name": "create_trello_list",
  "arguments": {
    "boardId": "507f1f77bcf86cd799439011",
    "name": "🔍 En revue"
  }
}
```

## 🎯 Cas d'usage pratiques

### Créer un board Kanban complet

```
Question: Crée un board Kanban complet pour la gestion de projet
```

**Workflow:**
1. Créer le board avec `create_trello_board`
2. Créer les colonnes standard :
   - "📋 Backlog"
   - "🎯 À faire"
   - "🚧 En cours"
   - "🔍 En revue"
   - "✅ Terminé"

### Organisation par équipe

```
Question: Crée un board pour l'équipe Marketing avec colonnes Idées, Planifié, En prod, Publié
```

**Résultat:**
- Board: "Marketing Q1"
- Lists: Idées 💡 / Planifié 📅 / En prod 🚀 / Publié ✅

---

**Prochains exemples:** [Cards et Comments](./02-cards-and-comments.md)
