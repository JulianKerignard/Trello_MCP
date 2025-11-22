# Exemples : Labels et Priorités

Ce guide montre comment utiliser les labels pour organiser et prioriser vos cartes.

## 🏷️ Gestion des Labels

### Lister les labels d'un board

Utilisez `list_labels` :

```
Question: Montre-moi tous les labels du board Roadmap Produit
```

**Outil:**
```json
{
  "name": "list_labels",
  "arguments": {
    "boardId": "507f1f77bcf86cd799439011"
  }
}
```

**Réponse:**
```json
[
  {
    "id": "65a1b2c3d4e5f6789abc2001",
    "name": "P1 - Critique",
    "color": "red",
    "idBoard": "507f1f77bcf86cd799439011"
  },
  {
    "id": "65a1b2c3d4e5f6789abc2002",
    "name": "P2 - Important",
    "color": "orange",
    "idBoard": "507f1f77bcf86cd799439011"
  },
  {
    "id": "65a1b2c3d4e5f6789abc2003",
    "name": "Bug",
    "color": "red",
    "idBoard": "507f1f77bcf86cd799439011"
  },
  {
    "id": "65a1b2c3d4e5f6789abc2004",
    "name": "Feature",
    "color": "green",
    "idBoard": "507f1f77bcf86cd799439011"
  }
]
```

### Créer un nouveau label

Utilisez `create_label` :

```
Question: Crée un label "P3 - Normal" de couleur yellow sur le board
```

**Outil:**
```json
{
  "name": "create_label",
  "arguments": {
    "boardId": "507f1f77bcf86cd799439011",
    "name": "P3 - Normal",
    "color": "yellow"
  }
}
```

**Couleurs disponibles:**
- `red` - Rouge (urgent, critique, bugs)
- `orange` - Orange (important)
- `yellow` - Jaune (normal)
- `green` - Vert (feature, amélioration)
- `blue` - Bleu (documentation, info)
- `purple` - Violet (design, UX)
- `pink` - Rose
- `sky` - Bleu ciel
- `lime` - Vert citron
- `black` - Noir
- `null` - Sans couleur

### Modifier un label existant

Utilisez `update_label` :

```
Question: Renomme le label "Bug" en "🐛 Bug Critique" et change la couleur en red
```

**Outil:**
```json
{
  "name": "update_label",
  "arguments": {
    "labelId": "65a1b2c3d4e5f6789abc2003",
    "name": "🐛 Bug Critique",
    "color": "red"
  }
}
```

## 🎯 Appliquer des Labels aux Cartes

### Ajouter un label à une carte

Utilisez `add_label_to_card` :

```
Question: Ajoute le label P1 - Critique à la carte "API authentification"
```

**Workflow:**
1. Récupère l'ID du label avec `list_labels`
2. Appelle `add_label_to_card`

**Outil:**
```json
{
  "name": "add_label_to_card",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111",
    "labelId": "65a1b2c3d4e5f6789abc2001"
  }
}
```

### Retirer un label d'une carte

Utilisez `remove_label_from_card` :

```
Question: Retire le label Bug de la carte maintenant corrigée
```

**Outil:**
```json
{
  "name": "remove_label_from_card",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111",
    "labelId": "65a1b2c3d4e5f6789abc2003"
  }
}
```

## 🎨 Systèmes de Priorités

### Système P1-P4

Créez un système de priorités cohérent :

```
Question: Crée un système de priorités P1 à P4 sur le board
```

**Labels à créer:**
1. **P1 - Critique** (red)
   - Bugs bloquants
   - Fonctionnalités vitales
   - Délais urgents

2. **P2 - Important** (orange)
   - Features importantes
   - Bugs majeurs
   - Délais proches

3. **P3 - Normal** (yellow)
   - Améliorations
   - Bugs mineurs
   - Features standard

4. **P4 - Basse** (green)
   - Nice to have
   - Optimisations
   - Documentation

### Système par Type

Organisez par type de tâche :

```
Labels à créer:
- 🐛 Bug (red)
- ✨ Feature (green)
- 📝 Documentation (blue)
- 🎨 Design (purple)
- ⚡ Performance (orange)
- 🔒 Sécurité (red)
- ♻️ Refactoring (yellow)
```

### Système par Équipe

```
Labels à créer:
- 👥 Frontend (sky)
- ⚙️ Backend (blue)
- 📱 Mobile (purple)
- 🎨 Design (pink)
- 🧪 QA (green)
- 📊 Data (orange)
```

## 🎯 Cas d'usage pratiques

### Triage de bugs

```
Workflow:
1. Créer carte bug avec description
2. Évaluer sévérité
3. Ajouter label P1/P2/P3/P4
4. Ajouter label "🐛 Bug"
5. Si critique (P1): ajouter aussi "🚨 Urgent"
6. Assigner et déplacer en "En cours"
```

### Sprint planning avec priorités

```
1. Lister toutes les cartes du board
2. Filtrer par label "P1 - Critique"
3. Déplacer dans "Sprint actuel"
4. Puis traiter P2, P3, P4 selon capacité
```

### Tableau de bord visuel

```
Utilisation des couleurs:
- Rouge (P1, Bugs, Urgent) → Action immédiate
- Orange (P2, Important) → Cette semaine
- Jaune (P3, Normal) → Ce mois
- Vert (P4, Feature) → Backlog
```

### Multi-labeling

Une carte peut avoir plusieurs labels :

```
Exemple:
Carte: "Optimiser temps de chargement page login"
Labels:
- P1 - Critique (red)
- ⚡ Performance (orange)
- ⚙️ Backend (blue)
- 🔒 Sécurité (red)
```

**Outil:**
```json
// Ajouter les 4 labels successivement
{"name": "add_label_to_card", "arguments": {"cardId": "...", "labelId": "P1-id"}}
{"name": "add_label_to_card", "arguments": {"cardId": "...", "labelId": "Perf-id"}}
{"name": "add_label_to_card", "arguments": {"cardId": "...", "labelId": "Backend-id"}}
{"name": "add_label_to_card", "arguments": {"cardId": "...", "labelId": "Secu-id"}}
```

## 📊 Recherche par Labels

Utilisez `search_trello_cards` avec filtre :

```
Question: Trouve toutes les cartes avec label P1 - Critique
```

**Requête:**
```json
{
  "query": "label:\"P1 - Critique\" is:open"
}
```

**Combinaisons:**
```
- Tous les bugs P1: "label:Bug label:P1"
- Features backend: "label:Feature label:Backend"
- Urgent non terminé: "label:Urgent is:open"
```

---

**Prochains exemples:** [Dates et Deadlines](./04-dates-and-deadlines.md)
