# Exemples : Dates et Deadlines

Ce guide montre comment gérer les dates limites et suivre les échéances.

## 📅 Gestion des Dates Limites

### Définir une date limite

Utilisez `set_card_due_date` avec format ISO 8601 :

```
Question: Définis la date limite du 31 décembre 2025 à 23h59 pour la carte "API authentification"
```

**Outil:**
```json
{
  "name": "set_card_due_date",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111",
    "dueDate": "2025-12-31T23:59:59.999Z"
  }
}
```

**Format de date:**
- **ISO 8601**: `YYYY-MM-DDTHH:mm:ss.sssZ`
- **UTC timezone**: toujours terminer par `Z`
- **Exemples valides**:
  - `2025-12-31T23:59:59.999Z` (31 déc 2025, 23h59)
  - `2025-06-15T12:00:00.000Z` (15 juin 2025, midi)
  - `2025-01-01T09:00:00.000Z` (1er jan 2025, 9h)

### Retirer une date limite

Utilisez `remove_card_due_date` :

```
Question: Supprime la date limite de la carte car elle n'est plus urgente
```

**Outil:**
```json
{
  "name": "remove_card_due_date",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111"
  }
}
```

### Marquer une date limite comme complétée

Utilisez `mark_due_date_complete` :

```
Question: Marque la deadline de la carte "Feature X" comme terminée
```

**Outil:**
```json
{
  "name": "mark_due_date_complete",
  "arguments": {
    "cardId": "65a1b2c3d4e5f6789abc1111",
    "complete": true
  }
}
```

**Démarquer comme complétée:**
```json
{
  "complete": false
}
```

## 📊 Suivi des Échéances

### Lister les cartes par date d'échéance

Utilisez `list_cards_by_due_date` :

```
Question: Montre-moi toutes les cartes avec date limite du board, triées par urgence
```

**Outil:**
```json
{
  "name": "list_cards_by_due_date",
  "arguments": {
    "boardId": "507f1f77bcf86cd799439011"
  }
}
```

**Réponse (triée par date croissante):**
```json
[
  {
    "id": "65a1b2c3d4e5f6789abc1111",
    "name": "Livraison MVP",
    "due": "2025-11-20T23:59:59.999Z",
    "dueComplete": false,
    "url": "https://trello.com/c/AbC123"
  },
  {
    "id": "65a1b2c3d4e5f6789abc2222",
    "name": "Tests end-to-end",
    "due": "2025-11-25T23:59:59.999Z",
    "dueComplete": false,
    "url": "https://trello.com/c/DeF456"
  },
  {
    "id": "65a1b2c3d4e5f6789abc3333",
    "name": "Documentation utilisateur",
    "due": "2025-12-01T23:59:59.999Z",
    "dueComplete": true,
    "url": "https://trello.com/c/GhI789"
  }
]
```

**Note:** Les cartes sans date limite ne sont pas incluses.

## 🎯 Cas d'usage pratiques

### Sprint de 2 semaines

```
Workflow:
1. Créer cartes pour le sprint
2. Définir date limite = fin du sprint
3. Exemple: sprint du 1-14 décembre

Pour chaque carte:
{
  "dueDate": "2025-12-14T23:59:59.999Z"
}
```

### Jalons de projet (Milestones)

```
Projet: Lancement produit Q1 2025

Jalons:
1. MVP (31 jan): "2025-01-31T23:59:59.999Z"
2. Beta (28 fév): "2025-02-28T23:59:59.999Z"
3. Launch (31 mar): "2025-03-31T23:59:59.999Z"

Créer une carte par jalon avec date limite
```

### Suivi quotidien

```
Question: Quelles sont les tâches à faire aujourd'hui ?

Workflow:
1. list_cards_by_due_date pour le board
2. Filtrer les cartes avec due <= aujourd'hui
3. Exclure les dueComplete = true
4. Résultat: liste des tâches urgentes
```

### Calendrier de releases

```
Carte: "Release v2.0"
Date: "2025-12-15T00:00:00.000Z"
Labels: P1, Feature, Release

Carte: "Release v2.1"
Date: "2026-01-15T00:00:00.000Z"
Labels: P2, Feature, Release

Lister par due date pour voir la roadmap temporelle
```

### Gestion de deadlines clients

```
Client A - Livraison site web
Carte: "Maquettes validées"
Due: "2025-11-30T23:59:59.999Z"
Complete: true ✅

Carte: "Développement frontend"
Due: "2025-12-15T23:59:59.999Z"
Complete: false ⏳

Carte: "Mise en production"
Due: "2025-12-20T23:59:59.999Z"
Complete: false ⏳
```

## ⏰ Alertes et Rappels

### Détection des retards

```
Logique:
IF due < maintenant AND dueComplete = false
THEN carte en retard ⚠️
```

**Exemple de recherche:**
```
Question: Trouve les cartes en retard

Workflow:
1. list_cards_by_due_date
2. Comparer due avec Date.now()
3. Filtrer dueComplete = false
4. Résultat: cartes à prioriser
```

### Échéances cette semaine

```
Workflow:
1. Calculer date fin de semaine
2. list_cards_by_due_date
3. Filtrer: maintenant <= due <= fin_semaine
4. Trier par urgence (date croissante)
```

### Dashboard de deadlines

```
Catégories:
- 🔴 En retard (due < now, !complete)
- 🟠 Aujourd'hui (due = today, !complete)
- 🟡 Cette semaine (due <= 7j, !complete)
- 🟢 Ce mois (due <= 30j, !complete)
- ✅ Terminées (complete = true)
```

## 📝 Bonnes Pratiques

### Dates réalistes

```
❌ Mauvais: Fixer toutes les cartes au même jour
✅ Bon: Échelonner avec buffer time

Exemple:
- Feature A: 2025-12-10
- Tests A: 2025-12-12 (+2j buffer)
- Feature B: 2025-12-15
- Tests B: 2025-12-17
- Integration: 2025-12-20 (+3j buffer)
```

### Marquer comme complété

```
Workflow de clôture:
1. Terminer la tâche
2. mark_due_date_complete(true)
3. Ajouter commentaire avec résultat
4. Déplacer carte en "Terminé"
5. (Optionnel) Archiver après validation
```

### Communication

```
Lors de modification de deadline:
1. set_card_due_date (nouvelle date)
2. add_card_comment("Deadline repoussée au XX car YY")
3. (Si applicable) Ajouter label "⏰ Deadline modifiée"
```

### Timezone

```
⚠️ Toujours utiliser UTC (Z)

Paris (UTC+1): 31 déc 2025 à 23h59 CET
= "2025-12-31T22:59:59.999Z" (UTC)

New York (UTC-5): 31 déc 2025 à 23h59 EST
= "2026-01-01T04:59:59.999Z" (UTC)
```

---

**Retour aux exemples:** [README](./README.md)
