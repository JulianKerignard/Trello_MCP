# 🎯 Trello MCP Server

<div align="center">

**Intégration puissante de Trello pour Claude Desktop via le Model Context Protocol**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/JulianKerignard/Trello_MCP)
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
- **🎨 Flexible** : 12 outils couvrant tous les besoins essentiels

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

### 🎯 Gestion des Cards (8 outils)

| Outil | Description |
|-------|-------------|
| `list_trello_cards` | Liste les cartes d'une list |
| `create_trello_card` | Crée une nouvelle carte |
| `add_card_comment` | Ajoute un commentaire |
| `move_trello_card` | Déplace une carte entre lists |
| `search_trello_cards` | Recherche des cartes |
| `update_card_description` | Modifie la description |
| `archive_card` | Archive une carte (réversible) |
| `delete_card` | Supprime définitivement ⚠️ |

---

## 📦 Installation

### Prérequis

- [Node.js](https://nodejs.org/) 18 ou supérieur
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Un compte [Trello](https://trello.com)
- [Claude Desktop](https://claude.ai/download) (optionnel mais recommandé)

### 🔧 Installation rapide

```bash
# Cloner le repository
git clone https://github.com/JulianKerignard/Trello_MCP.git
cd Trello_MCP

# Installer les dépendances
npm install

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

### Structure du projet

```
trello-mcp-server/
├── src/
│   ├── index.ts           # Point d'entrée du serveur MCP
│   ├── trello-client.ts   # Client API Trello avec gestion d'erreurs
│   └── types.ts           # Définitions TypeScript
├── build/                 # Code JavaScript compilé
├── .env.example           # Template pour les variables d'environnement
├── tsconfig.json          # Configuration TypeScript
├── package.json           # Dépendances et scripts
└── README.md
```

### Scripts disponibles

```bash
npm run build      # Compile TypeScript → JavaScript
npm run watch      # Compile en mode watch (développement)
npm run dev        # Build + démarre le serveur
npm run inspector  # Démarre avec MCP Inspector (debug)
npm start          # Démarre le serveur (requiert build préalable)
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
# ✅ Trello MCP Server v1.0.0 démarré avec succès
# 📋 12 outils disponibles: boards (2), lists (2), cards (8)
# 🔐 Authentifié avec l'API Trello
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

### Version actuelle : 1.0.0 ✅

**Toutes les fonctionnalités de la v1.0 sont disponibles :**
- ✅ Gestion complète des Boards (2 outils)
- ✅ Gestion complète des Lists (2 outils)
- ✅ Gestion complète des Cards (8 outils)
  - CRUD de base (créer, lire, commenter)
  - Déplacement de cartes
  - Recherche avancée
  - Modification de descriptions
  - Archivage et suppression

### 🚧 En cours de développement (v1.4)

- 🔄 `unarchive_card` - Désarchiver une carte
- ✏️ `update_card_name` - Modifier le nom d'une carte
- 🔍 `get_card_details` - Détails complets d'une carte
- 🏷️ **Gestion des Labels + Priorités (P1/P2/P3/P4)**
- 📅 **Gestion des Dates** (due dates, deadlines)

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
