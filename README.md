# 🎯 Trello MCP Server

<div align="center">

**Intégration puissante de Trello pour Claude Desktop via le Model Context Protocol**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/JulianKerignard/Trello_MCP)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-2025--06--18-purple)](https://modelcontextprotocol.io)

[Installation](#-installation) •
[Fonctionnalités](#-fonctionnalités) •
[Configuration](#-configuration) •
[Utilisation](#-utilisation) •
[Documentation](#-documentation)

</div>

---

## 📖 À propos

Trello MCP Server est un serveur [Model Context Protocol](https://modelcontextprotocol.io) qui permet à Claude Desktop et autres applications compatibles MCP d'interagir directement avec l'API Trello. Gérez vos boards, lists et cards en langage naturel !

### ✨ Pourquoi ce projet ?

- **🤖 Automatisation naturelle** : Demandez à Claude de gérer Trello pour vous
- **🔒 Sécurisé** : Vos credentials restent locaux
- **⚡ Rapide** : TypeScript compilé pour des performances optimales
- **🎨 Flexible** : 33 outils couvrant tous les besoins essentiels
- **🏗️ Architecture moderne** : Pattern Factory + Registry pour maintenabilité optimale (v2.0.0)

---

## 🚀 Fonctionnalités

### 📊 Gestion des Boards (2 outils)

| Outil | Description |
|-------|-------------|
| `list_trello_boards` | Liste tous vos boards Trello |
| `create_trello_board` | Crée un nouveau board |

### 📝 Gestion des Lists (2 outils)

| Outil | Description |
|-------|-------------|
| `list_trello_lists` | Liste les colonnes d'un board |
| `create_trello_list` | Crée une nouvelle colonne |

### 🎯 Gestion des Cards (11 outils)

| Outil | Description |
|-------|-------------|
| `list_trello_cards` | Liste les cartes d'une list |
| `create_trello_card` | Crée une nouvelle carte |
| `add_card_comment` | Ajoute un commentaire |
| `move_trello_card` | Déplace une carte entre lists |
| `search_trello_cards` | Recherche des cartes |
| `update_card_description` | Modifie la description |
| `update_card_name` | Modifie le nom d'une carte |
| `get_card_details` | Détails complets d'une carte |
| `archive_card` | Archive une carte (réversible) |
| `unarchive_card` | Désarchive une carte |
| `delete_card` | Supprime définitivement ⚠️ |

### 🏷️ Gestion des Labels (5 outils)

| Outil | Description |
|-------|-------------|
| `list_labels` | Liste tous les labels d'un board |
| `create_label` | Crée un nouveau label |
| `update_label` | Modifie un label existant |
| `add_label_to_card` | Ajoute un label à une carte |
| `remove_label_from_card` | Retire un label d'une carte |

### 📅 Gestion des Dates (4 outils)

| Outil | Description |
|-------|-------------|
| `set_card_due_date` | Définit une date limite |
| `remove_card_due_date` | Supprime la date limite |
| `mark_due_date_complete` | Marque la date comme complétée |
| `list_cards_by_due_date` | Liste les cartes triées par date |

### ✅ Gestion des Checklists (5 outils)

| Outil | Description |
|-------|-------------|
| `add_checklist_to_card` | Crée une nouvelle checklist |
| `add_checklist_item` | Ajoute un item à une checklist |
| `check_checklist_item` | Coche/décoche un item |
| `get_checklist_progress` | Récupère la progression détaillée |
| `delete_checklist` | Supprime une checklist ⚠️ |

### 👥 Gestion des Membres (4 outils)

| Outil | Description |
|-------|-------------|
| `get_board_members` | Liste tous les membres d'un board |
| `add_member_to_card` | Assigne un membre à une carte |
| `remove_member_from_card` | Retire l'assignation d'un membre |
| `get_member_cards` | Liste les cartes assignées à un membre |

---

## 📦 Installation

### 🚀 Installation Rapide avec Bundle MCPB (Recommandé)

**Installation en 1 clic pour Claude Desktop !**

1. **Télécharger le bundle** : [Trello_MCP.mcpb](https://github.com/JulianKerignard/Trello_MCP/releases/latest/download/Trello_MCP.mcpb) (3.0 MB)

2. **Installer** :
   - **Option A** : Double-cliquer sur le fichier `.mcpb` (macOS/Windows)
   - **Option B** : Dans Claude Desktop → Settings → Extensions → Advanced → Install from file

3. **Configurer vos credentials Trello** :
   - API Key : Obtenir sur https://trello.com/power-ups/admin
   - API Token : Cliquer sur "Token" et autoriser avec permissions read/write

4. **C'est tout !** 🎉 Le serveur MCP est installé et prêt à l'emploi.

**Vérification** :
```
"Liste tous mes boards Trello" → Claude affiche vos boards
```

---

### 🛠️ Installation Manuelle (Développeurs)

**Prérequis** :
- [Node.js](https://nodejs.org/) 18 ou supérieur
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Un compte [Trello](https://trello.com)

**Étapes** :

```bash
# Cloner le repository
git clone https://github.com/JulianKerignard/Trello_MCP.git
cd Trello_MCP

# Installer les dépendances
npm install --production

# Compiler le projet
npm run build
```

---

## 🔑 Configuration

### Étape 1 : Obtenir vos credentials Trello

1. Rendez-vous sur https://trello.com/power-ups/admin
2. Créez un Power-Up (si nécessaire)
3. Cliquez sur **"Generate a new API Key"**
4. Notez votre **API Key** 📝
5. Cliquez sur **"Token"** pour générer un **API Token**
6. Accordez les permissions **read** et **write**
7. Notez votre **Token** 📝

### Étape 2 : Configurer les credentials

**Option A : Fichier .env (développement local)**

```bash
cp .env.example .env
```

Éditez `.env` et ajoutez vos credentials :

```env
TRELLO_API_KEY=votre_api_key_ici
TRELLO_API_TOKEN=votre_token_ici
```

**Option B : Claude Desktop (recommandé)**

Éditez le fichier de configuration :
- **macOS** : `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows** : `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": [
        "/chemin/absolu/vers/trello-mcp-server/build/index.js"
      ],
      "env": {
        "TRELLO_API_KEY": "votre_api_key",
        "TRELLO_API_TOKEN": "votre_token"
      }
    }
  }
}
```

⚠️ **Important** : Utilisez le **chemin absolu** vers `build/index.js`

### Étape 3 : Redémarrer Claude Desktop

Fermez et relancez Claude Desktop pour charger le serveur MCP.

---

## 💬 Utilisation

### Exemples avec Claude Desktop

```
Vous : "Liste tous mes boards Trello"
Claude : [Utilise list_trello_boards et affiche vos boards]

Vous : "Crée un board 'Projet Marketing' avec 3 lists : Backlog, En cours, Terminé"
Claude : [Crée automatiquement le board et les 3 lists]

Vous : "Ajoute une carte 'Rédiger article blog' dans To Do avec une description"
Claude : [Crée la carte avec la description demandée]

Vous : "Déplace la carte 'Task X' vers Done"
Claude : [Déplace la carte automatiquement]

Vous : "Archive toutes les cartes terminées"
Claude : [Archive les cartes identifiées]

Vous : "Cherche les cartes qui contiennent 'bug'"
Claude : [Recherche et affiche les résultats]
```

### ⚠️ Gestion de l'archivage vs suppression

```
✅ RECOMMANDÉ : Archiver d'abord
Vous : "Archive la carte 'Ancienne tâche'"
→ Carte archivée (réversible)

⚠️ ATTENTION : Suppression définitive
Vous : "Supprime définitivement la carte 'Spam'"
→ Carte supprimée (IRRÉVERSIBLE)

💡 Workflow optimal :
1. Archiver les cartes terminées
2. Vérifier après quelques jours
3. Supprimer seulement si vraiment inutile
```

---

## 🛠️ Développement

### Structure du projet (v2.0.0 - Architecture Handler Registry)

```
trello-mcp-server/
├── src/
│   ├── index.ts                      # Point d'entrée (175 lignes, -90% vs v1.x)
│   ├── trello-client.ts              # Client API Trello avec gestion d'erreurs
│   ├── types.ts                      # Définitions TypeScript principales
│   ├── logger.ts                     # Configuration Pino logging
│   └── handlers/                     # 🆕 Architecture modulaire (v2.0.0)
│       ├── types.ts                  # Interfaces ToolHandler, ValidationRule
│       ├── base-handler.ts           # Classe abstraite avec validation
│       ├── tool-registry.ts          # Registre central (Map-based)
│       ├── index.ts                  # Registration des 33 handlers
│       ├── boards-handlers.ts        # 2 handlers boards
│       ├── lists-handlers.ts         # 2 handlers lists
│       ├── cards-handlers.ts         # 11 handlers cards
│       ├── labels-handlers.ts        # 5 handlers labels
│       ├── dates-handlers.ts         # 4 handlers dates
│       ├── checklists-handlers.ts    # 5 handlers checklists
│       └── members-handlers.ts       # 4 handlers members
├── build/                            # Code JavaScript compilé
├── .env.example                      # Template pour les variables d'environnement
├── tsconfig.json                     # Configuration TypeScript
├── package.json                      # Dépendances et scripts
├── CHANGELOG.md                      # Historique des versions
└── README.md
```

**🎯 Avantages de l'architecture v2.0.0** :
- ✅ **Maintenabilité** : Code modulaire par domaine (boards, cards, labels, etc.)
- ✅ **Extensibilité** : Ajout de nouveaux outils sans modifier index.ts
- ✅ **Type Safety** : Génériques TypeScript `<TArgs, TResult>`
- ✅ **Validation centralisée** : ValidationRule déclarative
- ✅ **Performance** : Lookup O(1) via Map (vs 33 if-statements)
- ✅ **DRY** : Duplication ~70% → ~5%

### Scripts disponibles

```bash
# Build & Développement
npm run build         # Compile TypeScript → JavaScript
npm run watch         # Compile en mode watch (développement)
npm run dev           # Build + démarre le serveur
npm run inspector     # Démarre avec MCP Inspector (debug)
npm start             # Démarre le serveur (requiert build préalable)

# Tests & Qualité (v2.0.0)
npm test              # Execute les tests unitaires (36 tests)
npm run test:watch    # Tests en mode watch
npm run test:ui       # Interface UI pour les tests
npm run test:coverage # Tests avec couverture de code
npm run typecheck     # Vérifie les types sans compiler
npm run lint          # Vérifie le code (ESLint)
npm run lint:fix      # Corrige automatiquement les erreurs ESLint
npm run format        # Formate le code (Prettier)

# Bundle & Distribution
npm run pack:mcpb     # Crée le bundle .mcpb pour distribution
npm run clean         # Nettoie build/ node_modules/ *.mcpb
npm run clean:build   # Nettoie uniquement build/
```

### Développement avec MCP Inspector

L'[MCP Inspector](https://github.com/modelcontextprotocol/inspector) permet de tester les outils interactivement :

```bash
npm run inspector
```

Ouvrez votre navigateur à l'URL affichée pour tester chaque outil.

### Tests manuels

```bash
# Test rapide
npm run dev

# Le serveur affichera :
# ✅ Trello MCP Server v2.0.0 démarré avec succès
# 📋 33 outils disponibles: boards (2), lists (2), cards (11),
#    labels (5), dates (4), checklists (5), members (4)
# 🔐 Authentifié avec l'API Trello
# 🏗️ Architecture: Handler Registry Pattern
```

---

## 📚 Documentation

### Architecture MCP

Ce serveur implémente la spécification [Model Context Protocol 2025-06-18](https://spec.modelcontextprotocol.io/specification/2025-06-18/). Il expose des **outils** (tools) que les LLM peuvent appeler pour interagir avec Trello.

### Gestion des erreurs

Le serveur gère automatiquement :
- ✅ Authentification invalide (401)
- ✅ Ressources non trouvées (404)
- ✅ Rate limiting Trello (429)
- ✅ Validation des IDs (24 caractères)
- ✅ Connexion réseau

Tous les messages d'erreur sont en français et explicites.

### API Trello

Ce serveur utilise l'[API REST Trello v1](https://developer.atlassian.com/cloud/trello/rest/api-group-actions/). Points importants :

- **Base URL** : `https://api.trello.com/1`
- **Authentification** : API Key + Token (OAuth 1.0)
- **Rate Limits** : 300 requêtes / 10 secondes / token
- **Timeout** : 30 secondes par requête

---

## 🗺️ Roadmap

### 📋 [Voir la Roadmap complète sur Trello](https://trello.com/invite/b/691872c259e5684db478c009/ATTI1878973b0e7e6689fe8c4e1d659a20b86818E860/trellomcproadmap)

**Consultez notre board Trello pour suivre en temps réel les fonctionnalités terminées, en cours de développement et prévues !**

### Version actuelle : 1.4.0 ✅

**Toutes les fonctionnalités de la v1.4 sont disponibles :**
- ✅ Gestion complète des Boards (2 outils)
- ✅ Gestion complète des Lists (2 outils)
- ✅ Gestion complète des Cards (11 outils)
  - CRUD de base (créer, lire, commenter)
  - Déplacement et recherche de cartes
  - Modification (nom, description)
  - Archivage et suppression
  - Détails complets avec membres, checklists, attachments
- ✅ Gestion des Labels (5 outils)
  - Créer, modifier, supprimer des labels
  - Ajouter/retirer des labels sur les cartes
  - Support des priorités P1/P2/P3/P4
- ✅ Gestion des Dates (4 outils)
  - Définir et supprimer des dates limites
  - Marquer comme complété
  - Tri par date d'échéance

### 📋 Prochaines versions (v2.0)

- 👥 Gestion des Membres (assignation)
- ☑️ Gestion des Checklists (sous-tâches)
- 📎 Pièces Jointes (fichiers et liens)
- ⚡ Opérations en Masse (bulk)

Consultez la [board Roadmap](https://trello.com/invite/b/691872c259e5684db478c009/ATTI1878973b0e7e6689fe8c4e1d659a20b86818E860/trellomcproadmap) pour voir les détails et priorités de chaque feature.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

### Rapporter un bug

Ouvrez une [issue](https://github.com/JulianKerignard/Trello_MCP/issues) avec :
- Description du problème
- Étapes pour reproduire
- Version de Node.js et du serveur
- Logs pertinents

### Proposer une fonctionnalité

Ouvrez une [issue](https://github.com/JulianKerignard/Trello_MCP/issues) avec :
- Description de la fonctionnalité
- Cas d'usage
- Proposition d'implémentation (optionnel)

### Soumettre du code

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- [Anthropic](https://www.anthropic.com) pour Claude et le Model Context Protocol
- [Trello](https://trello.com) pour leur excellente API
- La communauté MCP pour les exemples et la documentation

---

## 📞 Support

Besoin d'aide ?

- 📖 [Documentation MCP](https://modelcontextprotocol.io)
- 📖 [API Trello](https://developer.atlassian.com/cloud/trello/rest/)
- 💬 [Issues GitHub](https://github.com/JulianKerignard/Trello_MCP/issues)
- 🗺️ [Roadmap Trello](https://trello.com/invite/b/691872c259e5684db478c009/ATTI1878973b0e7e6689fe8c4e1d659a20b86818E860/trellomcproadmap)

---

<div align="center">

**Fait avec ❤️ pour la communauté MCP**

⭐ Si ce projet vous est utile, n'hésitez pas à lui donner une étoile !

</div>
