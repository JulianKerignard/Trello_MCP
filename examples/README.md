# Exemples d'Utilisation - Trello MCP Server

Bienvenue dans les exemples d'utilisation du serveur MCP Trello ! Ce dossier contient des guides pratiques pour utiliser les 24 outils disponibles.

## 📚 Table des Matières

1. **[Boards et Lists](./01-boards-and-lists.md)**
   - Lister et créer des boards
   - Gérer les colonnes (lists)
   - Organiser vos projets

2. **[Cards et Comments](./02-cards-and-comments.md)**
   - Créer et gérer des cartes
   - Déplacer, archiver, supprimer
   - Ajouter des commentaires
   - Recherche avancée

3. **[Labels et Priorités](./03-labels-and-priorities.md)**
   - Créer et modifier des labels
   - Systèmes de priorités (P1-P4)
   - Catégorisation par type/équipe
   - Multi-labeling

4. **[Dates et Deadlines](./04-dates-and-deadlines.md)**
   - Définir des dates limites
   - Suivre les échéances
   - Gestion de sprints
   - Dashboard de deadlines

## 🚀 Démarrage Rapide

### Interaction avec Claude

Une fois le serveur MCP configuré, vous pouvez simplement discuter avec Claude :

```
Vous: Crée un board "Projet 2025" avec 4 colonnes: Backlog, En cours, En revue, Terminé

Claude: Je vais créer ce board Kanban pour vous...
[Appelle create_trello_board puis create_trello_list x4]

Vous: Ajoute une carte "Développer API" dans Backlog avec label P1

Claude: J'ajoute cette carte prioritaire...
[Appelle create_trello_card puis add_label_to_card]
```

### Les 24 Outils Disponibles

**Boards (2 outils)**
- `list_trello_boards` - Lister tous vos boards
- `create_trello_board` - Créer un nouveau board

**Lists (2 outils)**
- `list_trello_lists` - Lister les colonnes d'un board
- `create_trello_list` - Créer une nouvelle colonne

**Cards (11 outils)**
- `list_trello_cards` - Lister les cartes d'une liste
- `create_trello_card` - Créer une nouvelle carte
- `add_card_comment` - Ajouter un commentaire
- `move_trello_card` - Déplacer une carte
- `search_trello_cards` - Rechercher des cartes
- `update_card_description` - Modifier la description
- `archive_card` - Archiver une carte
- `delete_card` - Supprimer définitivement
- `unarchive_card` - Désarchiver une carte
- `update_card_name` - Renommer une carte
- `get_card_details` - Récupérer tous les détails

**Labels (5 outils)**
- `list_labels` - Lister les labels d'un board
- `create_label` - Créer un nouveau label
- `update_label` - Modifier un label
- `add_label_to_card` - Ajouter un label à une carte
- `remove_label_from_card` - Retirer un label

**Dates (4 outils)**
- `set_card_due_date` - Définir une date limite
- `remove_card_due_date` - Supprimer une date limite
- `mark_due_date_complete` - Marquer comme terminé
- `list_cards_by_due_date` - Lister par échéance

## 🎯 Workflows Complets

### Workflow : Nouveau Projet

```
1. Créer board "Mon Projet"
2. Créer colonnes: Backlog, En cours, Terminé
3. Créer labels P1-P4 + Bug/Feature
4. Créer première carte "Setup projet"
5. Ajouter description détaillée
6. Définir date limite (fin de semaine)
7. Ajouter label P1
8. Déplacer en "En cours"
```

### Workflow : Sprint Planning

```
1. Lister toutes les cartes du board
2. Rechercher cartes avec label "Sprint-Q1"
3. Filtrer par priorité (P1, P2)
4. Définir dates limites (fin de sprint)
5. Déplacer top 10 dans "Sprint Actuel"
6. Suivre progression quotidienne
```

### Workflow : Gestion de Bug

```
1. Créer carte "Bug: [description]"
2. Description détaillée:
   - Reproduction steps
   - Environnement
   - Screenshots
3. Labels: Bug + P1/P2/P3
4. Date limite selon sévérité
5. Commentaire avec investigation
6. Déplacer en "En cours"
7. Commentaire avec solution
8. Marquer deadline comme complétée
9. Déplacer en "Terminé"
10. Archiver après validation
```

### Workflow : Release Management

```
1. Créer board "Release v2.0"
2. Colonnes: Features, Dev, QA, Staging, Prod
3. Labels: Frontend, Backend, Mobile, Docs
4. Cartes avec deadlines échelonnées:
   - Feature freeze: J-30
   - Code freeze: J-14
   - Testing: J-7
   - Release: J-Day
5. Suivi avec list_cards_by_due_date
```

## 💡 Astuces et Bonnes Pratiques

### Nommage des Cartes

```
✅ Bon:
- "Développer API authentification OAuth2"
- "Bug: Crash au login avec email vide"
- "Docs: Guide installation Docker"

❌ Mauvais:
- "Truc à faire"
- "Fix"
- "API"
```

### Descriptions Structurées

```
## Contexte
[Pourquoi cette tâche existe]

## Objectif
[Ce qui doit être accompli]

## Critères d'Acceptation
- [ ] Critère 1
- [ ] Critère 2

## Ressources
- [Lien doc]
- [Lien mockup]
```

### Utilisation des Labels

```
Combinaisons efficaces:
- Type (Bug/Feature) + Priorité (P1-P4) + Équipe (Frontend/Backend)
- Exemple: [Bug][P1][Backend]

Couleurs cohérentes:
- Rouge: Urgent, bugs critiques, blockers
- Orange: Important, features prioritaires
- Jaune: Normal, améliorations
- Vert: Low, optimisations, docs
```

### Gestion des Dates

```
✅ Bonnes pratiques:
- Buffer time entre tâches dépendantes
- Deadlines réalistes
- Marquer comme complété quand terminé
- Communiquer les changements (commentaires)

❌ À éviter:
- Toutes les tâches avec la même deadline
- Dates irréalistes
- Oublier de marquer comme complété
- Changer deadline sans communication
```

## 🔍 Recherche Avancée

### Syntaxe de Recherche

```
Exemples:
- name:"API" - Cartes avec "API" dans le nom
- description:"bug" - Description contient "bug"
- label:"P1" - Cartes avec label P1
- is:open - Cartes non archivées
- is:archived - Cartes archivées
- has:members - Cartes avec membres assignés
```

### Recherches Combinées

```
{
  "query": "label:Bug label:P1 is:open",
  "limit": 50
}
// Résultat: Bugs P1 non résolus
```

```
{
  "query": "name:API description:authentification",
  "boardIds": ["507f1f77bcf86cd799439011"],
  "partial": true
}
// Résultat: Cartes API auth sur board spécifique
```

## 📊 Cas d'Usage par Industrie

### Développement Logiciel

- Sprint planning avec dates
- Bug tracking avec priorités
- Code reviews (labels: Review, Approved)
- Releases avec milestones

### Marketing

- Calendrier éditorial (dates de publication)
- Campagnes (labels par canal)
- A/B tests (labels: Test A, Test B)
- ROI tracking (commentaires avec metrics)

### Support Client

- Tickets par priorité (P1-P4)
- SLA avec deadlines
- Catégories (labels: Tech, Billing, Account)
- Escalation (label: Escalated)

### Gestion de Projet

- Jalons projet (milestones avec dates)
- Ressources (labels par équipe)
- Budget tracking (commentaires)
- Risques (label: Risk + P1/P2/P3)

## 🆘 Dépannage

### La carte n'est pas trouvée

```
Problème: ID de carte invalide
Solution: Utiliser list_trello_cards pour obtenir l'ID complet (24 caractères)
❌ Mauvais: https://trello.com/c/AbCdEf (short link)
✅ Bon: "65a1b2c3d4e5f6789abc1111" (ID complet)
```

### Le label n'apparaît pas

```
Problème: Label non ajouté
Solution:
1. Vérifier list_labels pour obtenir l'ID correct
2. Utiliser add_label_to_card avec les bons IDs
3. Vérifier get_card_details pour confirmer
```

### Les dates ne s'affichent pas

```
Problème: Format de date incorrect
Solution: Utiliser ISO 8601 avec timezone UTC
❌ Mauvais: "2025-12-31"
✅ Bon: "2025-12-31T23:59:59.999Z"
```

## 📞 Support

- **Documentation MCP**: [README principal](../README.md)
- **Tests**: [Guide des tests](../src/README.tests.md)
- **Issues**: [GitHub Issues](https://github.com/juliankerignard/trello-mcp-server/issues)

---

**Prêt à commencer ?** Choisissez un guide ci-dessus et lancez-vous ! 🚀
